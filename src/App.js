import React, { useRef, useState } from 'react'
import * as tf from '@tensorflow/tfjs';
import * as handpose from '@tensorflow-models/handpose';
import Webcam from 'react-webcam'; 

import * as fp from 'fingerpose';
import victory from './victory.png';
import thumbs_up from './thumbs_up.png';

import { drawHand } from './utlities';
import './App.css';

function App() {
	const webCamRef = useRef(null);
	const canvasRef = useRef(null);

	const [emoji, setEmoji] = useState(null);
	const images = {thumbs_up: thumbs_up, victory: victory}

	const runHandpose = async() => {
		const net = await handpose.load();
		console.log('Handpose Model Loaded')

		setInterval(() => {
			detectHand(net)
		}, 100)
	}

	const detectHand = async(net) => {
		// Check data is available
		if (
			typeof webCamRef.current !== 'undefined' &&
			webCamRef.current !== null &&
			webCamRef.current.video.readyState === 4
		) {
			// Get Video Properties
			const video = webCamRef.current.video;
			const videoWidth = webCamRef.current.video.videoWidth;
			const videoHeight = webCamRef.current.video.videoHeight;

			// Set Video height & width
			webCamRef.current.video.width = videoWidth;
			webCamRef.current.video.height = videoHeight;

			//Set canvas height and width
			canvasRef.current.width = videoWidth;
			canvasRef.current.height = videoHeight;

			// Make Detections
			const hand = await net.estimateHands(video);
			// console.log(hand)

			if (hand.length > 0) {
				const GE = new fp.GestureEstimator([
					fp.Gestures.VictoryGesture,
					fp.Gestures.ThumbsUpGesture
				])

				const gesture = await GE.estimate(hand[0].landmarks, 8);
				// console.log(gesture)
				if (gesture.gestures !== undefined && gesture.gestures.length > 0) {
					const confidence = gesture.gestures.map(
						(prediction) => prediction.confidence
					);

					const maxConfidence = confidence.indexOf(
						Math.max.apply(null, confidence)
					);

					setEmoji(gesture.gestures[maxConfidence].name);
					console.log(emoji)
				}
			}

			// Draw mesh
			const ctx = canvasRef.current.getContext("2d");
			drawHand(hand, ctx);
		}
	}

	runHandpose();

	return (
		<div className="App">
			<header className="App-header">
				<Webcam 
					ref={webCamRef}
					style={{ position: 'absolute', marginLeft: "auto", marginRight: "auto", left: 0, right: 0, textAlign: 'center', zIndex: 9, width: 640, height: 480 }}
				/>
				<canvas 
					ref={canvasRef}
					style={{ position: 'absolute', marginLeft: "auto", marginRight: "auto", left: 0, right: 0, textAlign: 'center', zIndex: 9, width: 640, height: 480 }}
				/>

				{
					emoji !== null 
					? 
					<img 
						src={images[emoji]} 
						style={{ position: 'absolute', marginLeft: "auto", marginRight: "auto", left: 950, top: 50, textAlign: 'center', height:100, zIndex: 10 }} 
					/>
					: ""
				}
			</header>
		</div>
	);
}

export default App;
