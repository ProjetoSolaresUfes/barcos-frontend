import React from "react";
import "@carbon/charts/styles.css";
import { LineChart } from "@carbon/charts-react";


export function Chart(){
  const ScaleTypes = {
    LABELS: "labels",
    LABELS_RATIO: "labels-ratio",
    LINEAR:"linear",
    LOG:"log",
    TIME:"time"
  }
  
  const data = [
    {
      "group": "Dataset 1",
      "key": "Qty",
      "value": 34200
    },
    {
      "group": "Dataset 1",
      "key": "More",
      "value": 23500
    },
    {
      "group": "Dataset 1",
      "key": "Sold",
      "value": 53100
    },
    {
      "group": "Dataset 1",
      "key": "Restocking",
      "value": 42300
    },
    {
      "group": "Dataset 1",
      "key": "Misc",
      "value": 12300
    },
    {
      "group": "Dataset 2",
      "key": "Qty",
      "value": 34200
    },
    {
      "group": "Dataset 2",
      "key": "More",
      "value": 53200
    },
    {
      "group": "Dataset 2",
      "key": "Sold",
      "value": 42300
    },
    {
      "group": "Dataset 2",
      "key": "Restocking",
      "value": 21400
    },
    {
      "group": "Dataset 2",
      "key": "Misc",
      "value": 0
    },
    {
      "group": "Dataset 3",
      "key": "Qty",
      "value": 41200
    },
    {
      "group": "Dataset 3",
      "key": "More",
      "value": 18400
    },
    {
      "group": "Dataset 3",
      "key": "Sold",
      "value": 34210
    },
    {
      "group": "Dataset 3",
      "key": "Restocking",
      "value": 1400
    },
    {
      "group": "Dataset 3",
      "key": "Misc",
      "value": 42100
    },
    {
      "group": "Dataset 4",
      "key": "Qty",
      "value": 22000
    },
    {
      "group": "Dataset 4",
      "key": "More",
      "value": 1200
    },
    {
      "group": "Dataset 4",
      "key": "Sold",
      "value": 9000
    },
    {
      "group": "Dataset 4",
      "key": "Restocking",
      "value": 24000,
      "audienceSize": 10
    },
    {
      "group": "Dataset 4",
      "key": "Misc",
      "value": 3000,
      "audienceSize": 10
    }
  ]

  const options = {
    "title": "Line (discrete)",
    "axes": {
      "bottom": {
        "title": "2019 Annual Sales Figures",
        "mapsTo": "key",
        "scaleType": ScaleTypes.LABELS
      },
      "left": {
        "mapsTo": "value",
        "title": "Conversion rate",
        "scaleType": ScaleTypes.LINEAR
      }
    },
    "height": "400px",
  };
  
  

  return (
		<div className='w-full h-full'>
      <LineChart data={data} options={options as any} />
    </div>
  )
}