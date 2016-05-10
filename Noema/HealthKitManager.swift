//
//  HealthKitManager.swift
//  Karenina
//
//  Created by Brian Herhusky on 4/23/16.
//  Copyright © 2016 Razeware. All rights reserved.
//
import Foundation
import HealthKit

class HealthKitManager: NSObject {
    
    static let healthKitStore = HKHealthStore()
    
    static func authorizeHealthKit() {
        
        let healthKitTypes: Set = [
            HKObjectType.quantityTypeForIdentifier(HKQuantityTypeIdentifierHeartRate)!,
            HKObjectType.quantityTypeForIdentifier(HKQuantityTypeIdentifierDistanceWalkingRunning)!
        ]
        
        healthKitStore.requestAuthorizationToShareTypes(healthKitTypes,
                                                        readTypes: healthKitTypes) { _, _ in }
    }
    static func saveMockHeartData() {
        
        // 1. Create a heart rate BPM Sample
        let heartRateType = HKQuantityType.quantityTypeForIdentifier(HKQuantityTypeIdentifierHeartRate)!
        let heartRateQuantity = HKQuantity(unit: HKUnit(fromString: "count/min"),
                                           doubleValue: Double(arc4random_uniform(80) + 100))
        let heartSample = HKQuantitySample(type: heartRateType,
                                           quantity: heartRateQuantity, startDate: NSDate(), endDate: NSDate())
        
        // 2. Save the sample in the store
        healthKitStore.saveObject(heartSample, withCompletion: { (success, error) -> Void in
            if let error = error {
                print("Error saving heart sample: \(error.localizedDescription)")
            }
        })
    }
}