import React, { FunctionComponent } from "react"
import { ScrollView, View, StyleSheet } from "react-native"
import { useTranslation } from "react-i18next"
import Config from "react-native-config"
import { VictoryAxis, VictoryBar, VictoryChart } from "victory-native"

import { useStatusBarEffect } from "../navigation"
import { Text, StatusBar } from "../components"
import { Colors, Spacing, Typography } from "../styles"

interface DataRecord {
  fields: DataRecordFields
}
interface DataRecordFields {
  dailyCases: string
  dailyDeaths: string
  dailyTests: string
  date: string
  totalCases: string
  totalDeaths: string
}

function extractDataValue(
  data: DataRecordFields[],
  key: string,
): [number, { x: string; y: number }[]] {
  let max = -1

  const values = data
    .slice(0, 7)
    .reverse()
    .map((el: DataRecordFields) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const y = +el[key]
      max = max < y ? y : max
      return {
        x: el.date,
        y,
      }
    })

  return [max, values]
}

const Reporting: FunctionComponent = () => {
  useStatusBarEffect("dark-content", Colors.secondary.shade10)
  const { t } = useTranslation()

  const axisStyle = { tickLabels: { padding: 10, fontSize: 12 } }

  const [data, setData] = React.useState([] as DataRecordFields[])
  const [loading, setLoading] = React.useState(true)
  const [loadingError, setLoadingError] = React.useState(false)

  const [dailyCasesMax, setDailyCasesMax] = React.useState(0)
  const dailyCasesData = React.useMemo(() => {
    const [max, values] = extractDataValue(data, "dailyCases")

    setDailyCasesMax(max + 1)

    return values
  }, [data])

  const [dailyDeathsMax, setDailyDeathsMax] = React.useState(0)
  const dailyDeathsData = React.useMemo(() => {
    const [max, values] = extractDataValue(data, "dailyDeaths")

    setDailyDeathsMax(max + 1)

    return values
  }, [data])

  const [totalCasesMax, setTotalCasesMax] = React.useState(0)
  const totalCasesData = React.useMemo(() => {
    const [max, values] = extractDataValue(data, "totalCases")

    setTotalCasesMax(max + 1)

    return values
  }, [data])

  const [totalDeathsMax, setTotalDeathsMax] = React.useState(0)
  const totalDeathsData = React.useMemo(() => {
    const [max, values] = extractDataValue(data, "totalDeaths")

    setTotalDeathsMax(max + 1)

    return values
  }, [data])

  const chartSections = [
    {
      header: "reporting.headers.daily_cases",
      axisMax: dailyCasesMax,
      data: dailyCasesData,
    },
    {
      header: "reporting.headers.daily_deaths",
      axisMax: dailyDeathsMax,
      data: dailyDeathsData,
    },
    {
      header: "reporting.headers.total_cases",
      axisMax: totalCasesMax,
      data: totalCasesData,
    },
    {
      header: "reporting.headers.total_deaths",
      axisMax: totalDeathsMax,
      data: totalDeathsData,
    },
  ].map((s, index) => (
    <View key={index} style={style.section}>
      <Text style={style.subheader}>{t(s.header)}</Text>

      {loading && !loadingError && (
        <Text style={style.chartOtherText}>{t("reporting.loading")}</Text>
      )}

      {loadingError && (
        <Text style={style.chartOtherText}>{t("reporting.loading_error")}</Text>
      )}

      {!loading && (
        <VictoryChart height={200} domainPadding={10}>
          <VictoryAxis fixLabelOverlap style={axisStyle} />
          <VictoryAxis dependentAxis domain={{ y: [0, s.axisMax] }} />
          <VictoryBar
            style={{ data: { fill: Colors.accent.danger100 } }}
            data={s.data}
          />
        </VictoryChart>
      )}
    </View>
  ))

  React.useEffect(init, [])

  function init() {
    async function loadData() {
      let res
      try {
        res = await fetch(Config.AIRTABLE_URL)
      } catch (err) {
        console.error(err)
        setLoadingError(true)
        return
      }

      let data
      try {
        data = await res.json()
      } catch (err) {
        console.error(err)
        setLoadingError(true)
        return
      }

      if (!data.records) {
        console.error("something went wrong", data)
        setLoadingError(true)
        return
      }

      setData(data.records.map((el: DataRecord) => ({ ...el.fields })))
      setLoading(false)
    }

    loadData()
  }

  return (
    <>
      <StatusBar backgroundColor={Colors.secondary.shade10} />
      <ScrollView style={style.container} alwaysBounceVertical={false}>
        <Text style={style.headerText}>{t("screen_titles.reporting")}</Text>

        {chartSections}
      </ScrollView>
    </>
  )
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.secondary.shade10,
  },
  headerText: {
    ...Typography.header.x60,
    ...Typography.style.bold,
    marginVertical: Spacing.medium,
    marginHorizontal: Spacing.medium,
  },
  section: {
    backgroundColor: Colors.background.primaryLight,
    marginBottom: Spacing.xxLarge,
  },
  subheader: {
    ...Typography.header.x20,
    marginVertical: Spacing.medium,
    marginHorizontal: Spacing.medium,
    marginBottom: 0,
  },
  chartOtherText: {
    textAlign: "center",
    height: 50,
    lineHeight: 50,
  },
})

export default Reporting
