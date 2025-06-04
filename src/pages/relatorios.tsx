import { getFile, listFiles } from "@/firebase/functions/storage";
import { orderBy } from "lodash";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { Chart } from "@/components/Chart";
import LineChart from '../components/LineChart';
import { useEffect, useState } from "react";


export default function Relatorios() {
  const [files, setFiles] = useState<any>([]);
  const searchParams = useSearchParams();
	const [selectedOption, setSelectedOption] = useState<string>("");
  const [fileContent, setFileContent] = useState<string>("");
  const [chartData, setChartData] = useState<ChartData>([]);

  //const [selectedOption, setSelectedOption] = useState<string>("");



  const [tensaoBateria, setTensaoBateria] = useState<ChartData>([]);
  const [correnteMotor, setCorrenteMotor] = useState<ChartData>([]);
  const [potenciaMotor, setPotenciaMotor] = useState<ChartData>([]);
  const [velocidade, setVelocidade] = useState<ChartData>([]);
  const [correnteStrings, setCorrenteStrings] = useState<ChartData>([]);


  const router = useRouter();
	const file = searchParams.get("file") as string;







  type ChartData = {
  group: string;
  key: string;
  value: number;
  }[];

  function parseFileToChartData(fileContent: string, multiplier: number, description: string): ChartData  {
  const lines = fileContent.trim().split("\n");

  const data: ChartData = lines
    .map((line) => {
      const cols = line.trim().split(",");

      if (cols.length < 12) return null;

      const horaCompleta = cols[cols.length - 2]; // ex: "02/08/2023 13:29:03"
      const hora = horaCompleta.split(" ")[1];    // extrai só a hora: "13:29:03"

      const corrente = parseFloat(cols[multiplier]);       // coluna 2: corrente

      if (!hora || isNaN(corrente)) return null;

      return {
        group: description,
        key: hora,
        value: corrente,
      };
    })
    .filter((item): item is { group: string; key: string; value: number } => item !== null);

  return data;
}


	useEffect(() => { 
		setSelectedOption(file);
	}, [])

  useEffect(() => {
    async function getNameOfFiles() {
      const result = await listFiles();
      if (result !== undefined) {
        const arquivosOrdenados = orderBy(
          result,
          (f) => {
            const date = new Date(f.split(".")[0]);
            const dataPtBR = new Date(date.toLocaleString("pt-BR"));
            return dataPtBR;
          },
          "desc"
        );

        setFiles(arquivosOrdenados);
      }
    }
    getNameOfFiles();
  }, []);

  useEffect(() => {
  async function fetchFileContent() {
    if (!selectedOption || selectedOption === "Nenhum") {
      setFileContent("");
      return;
    }

    try {
      const url = await getFile(selectedOption);
      if (!url) {
        console.error("URL do arquivo não foi obtida.");
        return;
      }

      const response = await fetch(url);
      const text = await response.text();
      setFileContent(text);


      const parseTensaoBateria = parseFileToChartData(text, 4, "Tensão na Bateria");
      setTensaoBateria(parseTensaoBateria);

      const parseCorrenteMotor = parseFileToChartData(text, 0, "Corrente no Motor");
      setCorrenteMotor(parseCorrenteMotor);

      const parsePotenciaMotor = parseFileToChartData(text, 2, "Potencia do Motor");
      setPotenciaMotor(parsePotenciaMotor);

      const parseVelocidade = parseFileToChartData(text, 3, "Velocidade");
      setVelocidade(parseVelocidade);

      const parseCorrenteStrings = parseFileToChartData(text, 3, "Correte na String");
      setCorrenteStrings(parseCorrenteStrings);


    } catch (err) {
      console.error("Erro ao carregar arquivo:", err);
      setFileContent("Erro ao carregar arquivo.");
    }
  }

  fetchFileContent();
}, [selectedOption]);



  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedOption(value);
    router.push("", undefined);
  };

	return (
    <div className="flex flex-col h-screen w-full  py-8">
      <div className="flex justify-center">
        <select
          id="dropdown"
          value={selectedOption}
          onChange={handleChange}
        >
          <option value="Nenhum">Nenhum</option>
          {files.map((file: string, index: number) => (
            <option key={file} value={file}>
              {file}
            </option>
          ))}
        </select>
      </div>
      
      


      <div>
        <p>Nada: </p>
        {correnteMotor?.length > 0
            ? correnteMotor[0].value - correnteMotor[correnteMotor.length - 1].value
            : "Sem dados"
        } <br />
        
        <p>Hora Inicial: </p>
        {correnteMotor?.length > 0
            ? correnteMotor[0].key
            : "Sem dados"
        } <br />

        <p>Hora Final: </p> 
        {correnteMotor?.length > 0
            ? correnteMotor[correnteMotor.length - 1].key
            : "Sem dados"
        } <br />

        <p>Média Corrente: </p> 
        {correnteMotor?.length > 0
            ? correnteMotor.reduce((sum, d) => sum + d.value, 0) / correnteMotor.length
            : "Sem dados"
        } <br />

        <p>Máxima Corrente: {correnteMotor?.length > 0 ? Math.max(...correnteMotor.map(d => d.value)) : "Sem dados"}</p>



      </div>

<div className="mt-4 px-4">
        <h2 className="font-bold">Conteúdo do arquivo:</h2>
        <pre className="bg-gray-100 text-black p-4 rounded h-64 overflow-auto whitespace-pre-wrap">
          {fileContent || "Nenhum arquivo selecionado."}
        </pre>
      </div>
      


      <div className="flex flex-col gap-y-8 max-w-[1200px] mx-auto min-w-1200">

      {correnteMotor ? (
        <Chart data={correnteMotor}/>
      ) : (
        <p>Carregando dados...</p>
      )}

      {potenciaMotor ? (
        <Chart data={potenciaMotor}/>
      ) : (
        <p>Carregando dados...</p>
      )}

      {correnteStrings ? (
        <Chart data={correnteStrings}/>
      ) : (
        <p>Carregando dados...</p>
      )}

      
      </div>

    </div>
  );
}
/*
<div className="mt-4 px-4">
        <h2 className="font-bold">Conteúdo do arquivo:</h2>
        <pre className="bg-gray-100 text-black p-4 rounded h-64 overflow-auto whitespace-pre-wrap">
          {fileContent || "Nenhum arquivo selecionado."}
        </pre>
      </div>

<Chart data={correnteMotor} />
      <Chart data={potenciaMotor} />
      <Chart data={correnteStrings} />
      */ 