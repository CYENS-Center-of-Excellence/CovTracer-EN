import { Platform } from "react-native"

import * as DateTimeUtils from "./dateTime"
import * as StorageUtils from "./storage"

const isPlatformiOS = (): boolean => {
  return Platform.OS === "ios"
}

const isPlatformAndroid = (): boolean => {
  return Platform.OS === "android"
}

/**
 * Performs a deep merge of objects and returns new object. Does not modify
 * objects (immutable) and merges arrays via concatenation.
 * https://stackoverflow.com/a/48218209/1832062
 *
 * @param {...object} objects - Objects to merge
 * @returns {object} New object with merged key/values
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function mergeDeep(...objects) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const isObject = (obj) => obj && typeof obj === "object"

  return objects.reduce((prev, obj) => {
    Object.keys(obj).forEach((key) => {
      const pVal = prev[key]
      const oVal = obj[key]

      if (Array.isArray(pVal) && Array.isArray(oVal)) {
        prev[key] = pVal.concat(...oVal)
      } else if (isObject(pVal) && isObject(oVal)) {
        prev[key] = mergeDeep(pVal, oVal)
      } else {
        prev[key] = oVal
      }
    })

    return prev
  }, {})
}

export {
  DateTimeUtils,
  StorageUtils,
  isPlatformiOS,
  isPlatformAndroid,
  mergeDeep,
}
