import React from "react";
import dynamic from "next/dynamic";
const LineChart = dynamic(() => import("@carbon/charts-react").then((mod) => mod.LineChart), { ssr: false });
import { ScaleTypes } from "@carbon/charts/interfaces"; // Adicionado
import "@carbon/styles/css/styles.css";
import "@carbon/charts/styles.css";
import { title } from "process";

interface LineChartComponentProps {
  data: {
    group: string;
    key: string;
    value: number;
  }[];
  titleChart: string;
}

export function Chart({ data = [], titleChart }: LineChartComponentProps) {

  const options = {
    //title: "Dados do Barco",
    title: titleChart,
    axes: {
      bottom: {
        title: "Medições",
        mapsTo: "key",
        scaleType: "labels" as ScaleTypes, // Modificado
      },
      left: {
        mapsTo: "value",
        title: "Valores",
        scaleType: "linear" as ScaleTypes, // Modificado
      },
    },
    animations: false,
    height: "400px",
    data: {
      loading: data.length === 0,
    },
    color: {
      scale: {
        "Corrente Motor": "#FA8072	",
        "Corrente Baterias": "#006400",
        "Tensão Entrada MPPT": "#8B4513",
        "Tensão Saída MPPT": "#4B0082	",
        "Tensão Alimentação PCB":"#DC143C	",
        "Velocidade Barco": "#3CB371	",
        "Corrente MPPT": "#1E90FF"
        //"potenciaSaidaMPPT" : "#FA8072",
        //"potenciaEntradaMPPT" : "#FA8072",
       //"potenciaMotor" : "#FA8072",
       //"potenciaBateria" : "#FA8072"
      }
    }
  };

  if(data == undefined) return null;

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-lg p-4">
      <LineChart data={data} options={options} />
    </div>
  );
};
