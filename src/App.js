import React, { useRef } from 'react'
import * as tf from '@tensorflow/tfjs';
import * as handpose from '@tensorflow-models/handpose';
import Webcam from 'react-webcam'; 

import { drawHand } from './utlities';
import './App.css';

function App() {
	const webCamRef = useRef(null);
	const canvasRef = useRef(null);

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
			console.log(hand)

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
			</header>
		</div>
	);
}

export default App;
