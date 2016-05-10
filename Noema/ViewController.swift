//
//  ViewController.swift
//  Karenina
//
//  Created by Matt Luedke on 5/1/15.
//  Copyright (c) 2015 Razeware. All rights reserved.
//

import ResearchKit

class ViewController: UIViewController, ORKTaskViewControllerDelegate {
  
  @IBAction func consentTapped(sender : AnyObject) {
    let taskViewController = ORKTaskViewController(task: ConsentTask, taskRunUUID: nil)
    taskViewController.delegate = self
    presentViewController(taskViewController, animated: true, completion: nil)
  }
  
  @IBAction func surveyTapped(sender : AnyObject) {
    let taskViewController = ORKTaskViewController(task: SurveyTask(), taskRunUUID: nil)
    taskViewController.delegate = self
    presentViewController(taskViewController, animated: true, completion: nil)
  }
  
  @IBAction func microphoneTapped(sender : AnyObject) {
    let taskViewController = ORKTaskViewController(task: MicrophoneTask, taskRunUUID: nil)
    taskViewController.delegate = self
    taskViewController.outputDirectory = NSURL(fileURLWithPath: NSSearchPathForDirectoriesInDomains(.DocumentDirectory, .UserDomainMask, true)[0], isDirectory: true)
    presentViewController(taskViewController, animated: true, completion: nil)
  }
  
  @IBAction func authorizeTapped(sender: AnyObject) {
    HealthKitManager.authorizeHealthKit()
  }
    
  func taskViewController(taskViewController: ORKTaskViewController, didFinishWithReason reason: ORKTaskViewControllerFinishReason, error: NSError?) {
    
    if (reason != .Failed) {
      taskViewController.dismissViewControllerAnimated(true, completion: nil)
    }
  }
}
