import { CardDisplayData } from "@/components/CardDisplayData";
import { Chart } from "@/components/Chart";
import { Chat } from "@/components/Chat";
import ThemeToggle from "@/components/ThemeToggle";
import socket from "@/services/socketio";
import { ChartData, DadosBarco } from "@/types/ChartData";
import { transformDataChart } from "@/utils/chart";
import { formatDataChat } from "@/utils/chat-convert";
import Head from "next/head";
import { useEffect, useState } from "react";
// import { dadosBarco } from "@/mock/dados";

export default function Home() {
  const [dadoAtualBarco, setDadoAtualBarco] = useState<DadosBarco | undefined>(undefined);
  const [dadosBarco, setDadosBarco] = useState<DadosBarco[]>([]);
  const [dataForChart, setDataForChart] = useState<ChartData[]>([]);
  const [dataForChat, setDataForChat] = useState<string>("Sem dados do POENTE");
  const [speed, setSpeed] = useState<string>("0");

  useEffect(() => {
    socket.on('info', (dados: DadosBarco) => {
      // console.log(dados);
      setDadoAtualBarco(dados);
      
      // dadosBarcos vai ter somente os últimos 25 dados
      setDadosBarco((dadosBarcos) => {
        if (dadosBarcos.length >= 25) {
          return [...dadosBarcos.slice(1), dados];
        }
        return [...dadosBarcos, dados];
      });
    });

    socket.on('speedInfo', (speed) => {
      setSpeed(speed);
    });
  }, [])

  useEffect(() => {
    console.log('dadosBarco: ', dadosBarco);
    const newDataForChart = transformDataChart(dadosBarco);
    setDataForChart(newDataForChart);
    const newDataForChat = formatDataChat(dadosBarco);
    setDataForChat(newDataForChat);

  }, [dadosBarco])

  return (
    
    <div className='flex w-full flex-col items-center justify-center min-h-screen p-4 gap-4 overflow-y-auto'>
      <Head>
        <title>Telemetria POENTE</title>
        <meta name="description" content="Exibindo dados em tempo real do barco POENTE" />
        <link rel="icon" href="/logo.png" />
      </Head>

      <ThemeToggle />
      <iframe
        src="https://dsbrastreio.com.br/"
        width="100%"
        height="50%"
        className="rounded-lg shadow-lg w-full min-h-[350px]"
      />
      <div className='flex flex-col xl:flex-row items-center justify-center w-full h-auto gap-4'>
        <div className='w-full md:w-3/4 h-full md:h-full'>
          <CardDisplayData
            {...dadoAtualBarco}
            estadoStringSolar1={dadoAtualBarco?.estadoStringSolar1 == "1" ? 'ON' : 'OFF'}
            estadoStringSolar2={dadoAtualBarco?.estadoStringSolar2 == "1" ? 'ON' : 'OFF'}
            velocidade={speed}
          />
        </div>
        <div className='w-full md:h-full mt-4 md:mt-0'>
          <Chart data={dataForChart} />
        </div>
      </div>
      <Chat dadosBarco={dataForChat}/>
    </div>      
  )
}


