import React, { FunctionComponent } from "react"
import { Linking, StyleSheet, TouchableOpacity, View } from "react-native"
import { SvgXml } from "react-native-svg"
import { useTranslation } from "react-i18next"

import { Text } from "../../components"
import { useConfigurationContext } from "../../ConfigurationContext"

import { Buttons, Colors, Outlines, Spacing, Typography } from "../../styles"
import { Icons } from "../../assets"

const NoExposures: FunctionComponent = () => {
  const { t } = useTranslation()
  const {
    healthAuthorityLearnMoreUrl,
    measurementSystem,
  } = useConfigurationContext()

  const handleOnPressHALink = () => {
    Linking.openURL(healthAuthorityLearnMoreUrl)
  }

  const stayApartRecommendationText =
    measurementSystem === "Imperial"
      ? t("exposure_history.health_guidelines.six_feet_apart")
      : t("exposure_history.health_guidelines.two_meters_apart")

  const healthGuidelines = [
    { icon: Icons.StayApart, text: stayApartRecommendationText },
    {
      icon: Icons.Mask,
      text: t("exposure_history.exposure_detail.wear_a_mask"),
    },
    {
      icon: Icons.DisinfectSurfaces,
      text: t("exposure_history.exposure_detail.disinfect_surfaces"),
    },
    {
      icon: Icons.Ventilation,
      text: t("exposure_history.exposure_detail.ventilation"),
    },
    {
      icon: Icons.IsolateBubbles,
      text: t("exposure_history.exposure_detail.quarantine"),
    },
    {
      icon: Icons.WashHands,
      text: t("exposure_history.exposure_detail.wash_your_hands"),
    },
  ].map((el, index) => (
    <HealthGuidelineItem key={index} icon={el.icon} text={el.text} />
  ))
  return (
    <View style={style.container}>
      <View style={style.sectionContainer}>
        <Text style={style.subheaderText}>
          {t("exposure_history.no_exposure_reports")}
        </Text>
        <Text style={style.bodyText}>
          {t("exposure_history.no_exposure_reports_over_past")}
        </Text>
      </View>

      <View style={style.sectionContainer}>
        <Text style={style.subheaderText}>
          {t("exposure_history.health_guidelines.title")}
        </Text>
        {healthGuidelines}
      </View>

      {Boolean(healthAuthorityLearnMoreUrl) && (
        <View style={style.sectionContainer}>
          <Text style={style.subheaderText}>More Info</Text>

          <TouchableOpacity onPress={handleOnPressHALink} style={style.button}>
            <Text style={style.buttonText}>
              {t("exposure_history.review_health_guidance")}
            </Text>
            <SvgXml
              xml={Icons.Arrow}
              fill={Colors.neutral.white}
              style={style.ctaArrow}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

type HealthGuidelineItemProps = {
  text: string
  icon: string
  last?: boolean
}
const HealthGuidelineItem: FunctionComponent<HealthGuidelineItemProps> = ({
  text,
  icon,
  last,
}) => {
  const itemStyle = last
    ? { ...style.listItem, paddingBottom: 0 }
    : style.listItem

  return (
    <View style={itemStyle}>
      <View style={style.listItemIconContainer}>
        <SvgXml xml={icon} fill={Colors.primary.shade125} />
      </View>
      <View style={style.listItemTextContainer}>
        <Text style={style.listItemText}>{text}</Text>
      </View>
    </View>
  )
}

const style = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.medium,
  },
  sectionContainer: {
    marginBottom: Spacing.medium,
    paddingBottom: Spacing.xLarge,
    borderColor: Colors.neutral.shade10,
    borderBottomWidth: Outlines.hairline,
  },
  subheaderText: {
    ...Typography.header.x30,
    ...Typography.style.semibold,
    marginBottom: Spacing.xSmall,
  },
  bodyText: {
    ...Typography.body.x20,
  },
  ctaArrow: {
    marginLeft: Spacing.xxSmall,
  },
  listItem: {
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    paddingBottom: Spacing.small,
  },
  listItemIconContainer: {
    flex: 1,
  },
  listItemTextContainer: {
    flex: 6,
  },
  listItemText: {
    ...Typography.body.x20,
  },
  button: {
    ...Buttons.thin.base,
  },
  buttonText: {
    ...Typography.button.primary,
    marginRight: Spacing.small,
  },
})

export default NoExposures
