import Foundation
import React

@objc(Outbox)
class Outbox: NSObject {

  private static let appGroup = "group.com.linkstock.shared"
  private static let fileName = "outbox.json"

  @objc static func requiresMainQueueSetup() -> Bool { false }

  private func outboxURL() -> URL? {
    return FileManager.default
      .containerURL(forSecurityApplicationGroupIdentifier: Outbox.appGroup)?
      .appendingPathComponent(Outbox.fileName)
  }

  private func readArray() -> [Any] {
    guard let url = outboxURL(), FileManager.default.fileExists(atPath: url.path) else {
      return []
    }
    guard let data = try? Data(contentsOf: url),
          let parsed = try? JSONSerialization.jsonObject(with: data),
          let array = parsed as? [Any] else {
      return []
    }
    return array
  }

  private func writeArray(_ array: [Any]) throws {
    guard let url = outboxURL() else {
      throw NSError(domain: "Outbox", code: 1,
                    userInfo: [NSLocalizedDescriptionKey: "App group container unavailable"])
    }
    let data = try JSONSerialization.data(withJSONObject: array, options: [])
    try data.write(to: url, options: .atomic)
  }

  @objc(append:resolver:rejecter:)
  func append(_ jsonString: String,
              resolver resolve: RCTPromiseResolveBlock,
              rejecter reject: RCTPromiseRejectBlock) {
    guard let data = jsonString.data(using: .utf8),
          let entry = try? JSONSerialization.jsonObject(with: data) else {
      reject("Outbox", "Invalid JSON passed to append", nil)
      return
    }
    var array = readArray()
    array.append(entry)
    do {
      try writeArray(array)
      resolve(nil)
    } catch {
      reject("Outbox", "Failed to write outbox", error)
    }
  }

  @objc(drain:rejecter:)
  func drain(_ resolve: RCTPromiseResolveBlock,
             rejecter reject: RCTPromiseRejectBlock) {
    let array = readArray()
    do {
      try writeArray([])
      resolve(array)
    } catch {
      reject("Outbox", "Failed to clear outbox", error)
    }
  }
}
