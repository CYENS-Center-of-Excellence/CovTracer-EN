import React, { FunctionComponent } from "react"
import {
  createStackNavigator,
  StackNavigationOptions,
} from "@react-navigation/stack"

import { ReportingStackScreens } from "./index"
import { applyHeaderLeftBackButton } from "./HeaderLeftBackButton"

import { Headers } from "../styles"
import Reporting from "../Reporting"

const Stack = createStackNavigator()

const defaultScreenOptions: StackNavigationOptions = {
  ...Headers.headerMinimalOptions,
  headerLeft: applyHeaderLeftBackButton(),
  headerRight: () => null,
}

const ReportingStack: FunctionComponent = () => {
  return (
    <Stack.Navigator screenOptions={defaultScreenOptions}>
      <Stack.Screen
        name={ReportingStackScreens.Reporting}
        component={Reporting}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  )
}

export default ReportingStack
