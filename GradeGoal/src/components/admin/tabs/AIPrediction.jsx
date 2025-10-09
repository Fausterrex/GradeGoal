import React from "react";
import { Brain, Activity, CheckCircle2 } from "lucide-react";

const AIPrediction = () => {
  return (
    <div className="p-8 min-w-11/12 min-h-auto">
      <h1 className="text-3xl font-bold text-[#3C2363] mb-4">
        AI & Predictions Overview
      </h1>

      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-md p-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <Brain size={28} className="text-purple-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Prediction Accuracy</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">87.4%</p>
            </div>
          </div>
          <p className="text-green-500 font-semibold text-sm">+2.1%</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <Activity size={28} className="text-purple-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Predictions</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">45,231</p>
              <p className="text-gray-400 text-sm">All time</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <CheckCircle2 size={28} className="text-blue-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Model Confidence</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">92.3%</p>
              <p className="text-gray-400 text-sm">Avg confidence</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Model Performance Metrics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <p className="text-sm text-gray-500">MSE</p>
              <p className="text-lg font-semibold">0.0234</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <p className="text-sm text-gray-500">Last Retrain</p>
              <p className="text-lg font-semibold">2d ago</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <p className="text-sm text-gray-500">Avg Response</p>
              <p className="text-lg font-semibold">145ms</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <p className="text-sm text-gray-500">Success Rate</p>
              <p className="text-lg font-semibold">99.8%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPrediction;
