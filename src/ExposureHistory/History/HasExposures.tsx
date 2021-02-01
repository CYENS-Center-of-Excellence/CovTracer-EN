import React, { FunctionComponent } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { useConfigurationContext } from '../../ConfigurationContext'
import { ExposureDatum } from '../../exposure'
import ExposureListItem from './ExposureListItem'
import ExposureSummary from './ExposureSummary'
import { Text } from '../../components'

import { Colors, Iconography, Outlines, Spacing, Typography } from '../../styles'
import { Icons } from '../../assets'
import { SvgXml } from 'react-native-svg'

interface HasExposuresProps {
  exposures: ExposureDatum[]
}

const HasExposures: FunctionComponent<HasExposuresProps> = ({ exposures }) => {
  const { t } = useTranslation()
  const { quarantineLength, measurementSystem } = useConfigurationContext()

  const mostRecentExposure = exposures[0]

  const stayApartRecommendationText = measurementSystem === 'Imperial'
    ? t('exposure_history.exposure_detail.6ft_apart')
    : t('exposure_history.exposure_detail.2m_apart')
  const recommendations = [
    { icon: Icons.StayApart, text: stayApartRecommendationText },
    {
      icon: Icons.Mask,
      text: t('exposure_history.exposure_detail.wear_a_mask'),
    },
    {
      icon: Icons.WashHands,
      text: t('exposure_history.exposure_detail.wash_your_hands'),
    },
    {
      icon: Icons.DisinfectSurfaces,
      text: t('exposure_history.exposure_detail.disinfect_surfaces'),
    },
    {
      icon: Icons.Ventilation,
      text: t('exposure_history.exposure_detail.ventilation'),
    },
    {
      icon: Icons.IsolateBubbles,
      text: t('exposure_history.exposure_detail.quarantine'),
    },
  ].map((el, index) => (
    <RecommendationBubble key={index} icon={el.icon} text={el.text}/>
  ))

  return (
    <View style={style.container}>
      <View style={style.sectionContainer}>
        <Text style={style.subheaderText}>
          {t('exposure_history.exposure_report')}
        </Text>
        <ExposureSummary
          exposure={mostRecentExposure}
          quarantineLength={quarantineLength}
        />
      </View>

      <View style={{ ...style.sectionContainer, paddingBottom: 0 }}>
        <Text style={style.subheaderText}>
          {t('exposure_history.exposure_detail.header_1')}
        </Text>
        <View style={style.recommendations}>
          {recommendations}
        </View>
      </View>

      <View style={{ ...style.sectionContainer, paddingBottom: Spacing.small }}>
        <Text style={style.subheaderText}>
          {t('exposure_history.possible_exposures')}
        </Text>
        <Text style={style.bodyText}>
          {t('exposure_history.your_device_exchanged')}
        </Text>
        <ExposureList exposures={exposures}/>
      </View>

      {/*<View style={{ ...style.sectionContainer, paddingBottom: Spacing.xSmall }}>*/}
      {/*  <Text style={style.subheaderText}>*/}
      {/*    {t("exposure_history.next_steps")}*/}
      {/*  </Text>*/}
      {/*  <NextSteps exposureDate={mostRecentExposure.date} />*/}
      {/*</View>*/}
    </View>
  )
}

interface ExposureListProps {
  exposures: ExposureDatum[]
}

const ExposureList: FunctionComponent<ExposureListProps> = ({ exposures }) => {
  return (
    <View testID={'exposure-list'}>
      {exposures.map((exposure) => {
        return <ExposureListItem key={exposure.date} exposureDatum={exposure}/>
      })}
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
    marginBottom: Spacing.medium,
  },
  recommendations: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    marginBottom: Spacing.xxxLarge,
  },
})

type RecommendationBubbleProps = {
  text: string
  icon: string
}
const RecommendationBubble: FunctionComponent<RecommendationBubbleProps> = ({
  text,
  icon,
}) => {
  return (
    <View style={recommendationBubbleStyle.recommendation}>
      <View style={recommendationBubbleStyle.recommendationBubbleCircle}>
        <SvgXml
          xml={icon}
          fill={Colors.primary.shade125}
          width={Iconography.small}
          height={Iconography.small}
        />
      </View>
      <Text style={recommendationBubbleStyle.recommendationText}>
        {text}
      </Text>
    </View>
  )
}
const recommendationBubbleStyle = StyleSheet.create({
  recommendation: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '50%',
    marginBottom: Spacing.xxSmall,
  },
  recommendationBubbleCircle: {
    ...Iconography.smallIcon,
    borderRadius: Outlines.borderRadiusMax,
    backgroundColor: Colors.secondary.shade10,
    padding: Spacing.xLarge,
    marginTop: Spacing.xxSmall,
    marginBottom: Spacing.xxSmall,
  },
  recommendationText: {
    ...Typography.body.x10,
    textAlign: 'center',
  },
})

export default HasExposures
