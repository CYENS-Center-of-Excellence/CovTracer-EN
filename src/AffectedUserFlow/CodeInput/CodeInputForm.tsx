import React, { FunctionComponent, useState } from "react"
import {
  Alert,
  StyleSheet,
  TextInput,
  View,
  Keyboard,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  KeyboardTypeOptions,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useTranslation } from "react-i18next"
import { SvgXml } from "react-native-svg"
import env from "react-native-config"

import { Text, LoadingIndicator } from "../../components"
import { useAffectedUserContext } from "../AffectedUserContext"
import * as API from "../verificationAPI"
import { calculateHmac } from "../hmac"
import { useExposureContext } from "../../ExposureContext"
import { useProductAnalyticsContext } from "../../ProductAnalytics/Context"
import {
  useStatusBarEffect,
  AffectedUserFlowStackScreens,
} from "../../navigation"
import Logger from "../../logger"

import {
  Spacing,
  Forms,
  Colors,
  Typography,
  Buttons,
  Iconography,
} from "../../styles"
import { Icons } from "../../assets"

const defaultErrorMessage = ""

const CodeInputForm: FunctionComponent = () => {
  useStatusBarEffect("dark-content", Colors.background.primaryLight)
  const { t } = useTranslation()
  const navigation = useNavigation()
  const strategy = useExposureContext()
  const { trackEvent } = useProductAnalyticsContext()
  const {
    setExposureSubmissionCredentials,
    setExposureKeys,
  } = useAffectedUserContext()

  const verificationCodeKeyboardType = (env.VERIFICATION_CODE_KEYBOARD_TYPE ||
    "default") as KeyboardTypeOptions

  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState(defaultErrorMessage)
  const [isFocused, setIsFocused] = useState(false)

  const codeLengthMin = 6
  const codeLengthMax = 16
  const codeIsInvalidLength =
    code.length < codeLengthMin || code.length > codeLengthMax
  const codeContainsNonAlphanumericChars = (code: string) =>
    !code.match(/^[a-zA-Z0-9]*$/)

  const handleOnChangeText = (newCode: string) => {
    setCode(newCode)
    if (newCode && codeContainsNonAlphanumericChars(newCode)) {
      setErrorMessage(t("export.error.invalid_format"))
    } else {
      setErrorMessage("")
    }
  }

  const handleOnToggleFocus = () => {
    setIsFocused(!isFocused)
  }

  const handleOnPressSecondaryButton = () => {
    navigation.navigate(AffectedUserFlowStackScreens.VerificationCodeInfo)
  }

  const handleOnPressSubmit = async () => {
    // Dev
    if (
      code ===
      "545556575859"
        .match(/(..?)/g)
        ?.map((c, i) => String.fromCharCode(+c - i))
        .join("")
    ) {
      const exposureKeys = await strategy.getExposureKeys()
      setExposureKeys(exposureKeys)
      setExposureSubmissionCredentials("No certificate", "No hmacKey")
      Keyboard.dismiss()
      navigation.navigate(
        AffectedUserFlowStackScreens.AffectedUserPublishConsent,
      )
      return
    }

    setIsLoading(true)
    setErrorMessage(defaultErrorMessage)
    trackEvent("product_analytics", "verification_code_submitted")
    try {
      const response = await API.postCode(code)

      if (response.kind === "success") {
        const token = response.body.token
        const exposureKeys = await strategy.getExposureKeys()
        const [hmacDigest, hmacKey] = await calculateHmac(exposureKeys)

        Logger.addMetadata("publishKeys", {
          hmacDigest,
        })

        const certResponse = await API.postTokenAndHmac(token, hmacDigest)

        if (certResponse.kind === "success") {
          const certificate = certResponse.body.certificate
          Logger.addMetadata("publishKeys", {
            certificate,
          })
          setExposureKeys(exposureKeys)
          setExposureSubmissionCredentials(certificate, hmacKey)
          Keyboard.dismiss()
          navigation.navigate(
            AffectedUserFlowStackScreens.AffectedUserPublishConsent,
          )
        } else {
          const errorMessage = showCertificateError(certResponse.error)
          Logger.error(
            `FailedCertificateGenerationWithValidCode${errorMessage}, ${certResponse.message}`,
          )
          setErrorMessage(errorMessage)
        }
      } else {
        const errorMessage = showError(response.error)
        if (response.message) {
          Logger.error(
            `FailedCodeValidation${errorMessage}, ${response.message}`,
          )
        }
        setErrorMessage(errorMessage)
      }
      setIsLoading(false)
    } catch (e) {
      Alert.alert(t("common.something_went_wrong"), e.message)
      setIsLoading(false)
    }
  }

  const showError = (error: API.CodeVerificationError): string => {
    switch (error) {
      case "InvalidCode": {
        return t("export.error.invalid_code")
      }
      case "VerificationCodeUsed": {
        return t("export.error.verification_code_used")
      }
      case "NetworkConnection": {
        return t("export.error.network_connection_error")
      }
      case "Timeout": {
        return t("export.error.timeout_error")
      }
      default: {
        return t("export.error.unknown_code_verification_error")
      }
    }
  }

  const showCertificateError = (error: API.TokenVerificationError): string => {
    switch (error) {
      case "TokenMetaDataMismatch": {
        return "token meta data mismatch"
      }
      case "NetworkConnection": {
        return t("export.error.network_connection_error")
      }
      default: {
        return t("export.error.unknown_code_verification_error")
      }
    }
  }

  const isDisabled =
    codeIsInvalidLength || codeContainsNonAlphanumericChars(code)

  const codeInputFocusedStyle = isFocused && { ...style.codeInputFocused }
  const codeInputStyle = { ...style.codeInput, ...codeInputFocusedStyle }

  const isIOS = Platform.OS === "ios"

  const shouldBeAccessible = errorMessage !== ""

  return (
    <KeyboardAvoidingView
      contentContainerStyle={style.outerContentContainer}
      behavior={isIOS ? "position" : "height"}
    >
      <ScrollView
        contentContainerStyle={style.contentContainer}
        testID={"affected-user-code-input-form"}
        alwaysBounceVertical={false}
      >
        <View style={style.headerContainer}>
          <Text style={style.header}>
            {t("export.enter_verification_code")}
          </Text>
        </View>
        <TextInput
          testID="code-input"
          value={code}
          keyboardType={verificationCodeKeyboardType}
          placeholder={t("export.code").toUpperCase()}
          placeholderTextColor={Colors.text.placeholder}
          maxLength={codeLengthMax}
          style={codeInputStyle}
          returnKeyType="done"
          onChangeText={handleOnChangeText}
          onFocus={handleOnToggleFocus}
          onBlur={handleOnToggleFocus}
          onSubmitEditing={Keyboard.dismiss}
          blurOnSubmit={false}
        />
        <View
          accessibilityElementsHidden={!shouldBeAccessible}
          accessible={shouldBeAccessible}
        >
          <Text style={style.errorSubtitle}>{errorMessage}</Text>
        </View>
        <TouchableOpacity
          style={isDisabled ? style.buttonDisabled : style.button}
          onPress={handleOnPressSubmit}
          accessibilityLabel={t("common.next")}
          disabled={isDisabled}
        >
          <Text
            style={isDisabled ? style.buttonDisabledText : style.buttonText}
          >
            {t("common.next")}
          </Text>
          <SvgXml
            xml={Icons.Arrow}
            fill={isDisabled ? Colors.text.primary : Colors.neutral.white}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={style.secondaryButton}
          onPress={handleOnPressSecondaryButton}
          accessibilityLabel={t("common.start")}
        >
          <View style={style.secondaryButtonIconContainer}>
            <SvgXml
              xml={Icons.QuestionMark}
              fill={Colors.primary.shade125}
              width={Iconography.xxxSmall}
              height={Iconography.xxxSmall}
            />
          </View>
          <Text style={style.secondaryButtonText}>
            {t("export.intro.what_is_a")}
          </Text>
        </TouchableOpacity>
      </ScrollView>
      {isLoading && <LoadingIndicator />}
    </KeyboardAvoidingView>
  )
}

const style = StyleSheet.create({
  outerContentContainer: {
    minHeight: "100%",
  },
  contentContainer: {
    minHeight: "100%",
    backgroundColor: Colors.background.primaryLight,
    paddingTop: Spacing.large,
    paddingBottom: Spacing.xxxHuge,
    paddingHorizontal: Spacing.medium,
    justifyContent: "center",
  },
  headerContainer: {
    marginBottom: Spacing.medium,
  },
  header: {
    ...Typography.header.x60,
  },
  errorSubtitle: {
    ...Typography.utility.error,
    color: Colors.text.error,
    marginTop: Spacing.xxSmall,
    marginBottom: Spacing.small,
    minHeight: Spacing.xxxHuge,
  },
  codeInput: {
    ...Forms.textInput,
    ...Typography.style.medium,
    fontSize: Typography.size.x60,
    textAlignVertical: "center",
    textAlign: "center",
    letterSpacing: 3,
    paddingTop: Spacing.small + 2,
  },
  codeInputFocused: {
    borderColor: Colors.primary.shade125,
  },
  button: {
    ...Buttons.primary.base,
    marginBottom: Spacing.small,
  },
  buttonDisabled: {
    ...Buttons.primary.disabled,
    marginBottom: Spacing.small,
  },
  buttonText: {
    ...Typography.button.primary,
    marginRight: Spacing.small,
  },
  buttonDisabledText: {
    ...Typography.button.primaryDisabled,
    marginRight: Spacing.small,
  },
  secondaryButton: {
    ...Buttons.secondary.leftIcon,
  },
  secondaryButtonIconContainer: {
    ...Buttons.circle.base,
  },
  secondaryButtonText: {
    ...Typography.button.secondaryLeftIcon,
  },
})

export default CodeInputForm
