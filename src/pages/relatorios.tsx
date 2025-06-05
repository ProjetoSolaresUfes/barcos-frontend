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
  const [correnteString1, setCorrenteString1] = useState<ChartData>([]);
  const [correnteString2, setCorrenteString2] = useState<ChartData>([]);
  const [correnteStringSoma, setCorrenteStringsoma] = useState<ChartData>([]);


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


      //tensaoSaidaMPPT
      const parseTensaoBateria = parseFileToChartData(text, 7, "Tensão na Bateria");
      setTensaoBateria(parseTensaoBateria);

      //CorrenteMotor
      const parseCorrenteMotor = parseFileToChartData(text, 0, "Corrente no Motor");
      setCorrenteMotor(parseCorrenteMotor);

      // PotenciaMotor = TensaoSaidaMPPT * CorrenteMotor
      const parsePotenciaMotor = parseTensaoBateria.map((item, i) => ({
        group: 'Potencia do motor',
        key: item.key,
        value: item.value * parseCorrenteMotor[i].value,
      }));
      //const reduzido: ChartData = parsePotenciaMotor.filter((_, index) => index % 3 === 0);
      setPotenciaMotor(parsePotenciaMotor);

      //Velocidade
      const parseVelocidade = parseFileToChartData(text, 3, "Velocidade");
      setVelocidade(parseVelocidade);

      //Corrente String 1
      const parseCorrenteString1 = parseFileToChartData(text, 5, "Correte na String");
      setCorrenteString1(parseCorrenteString1);

      //Corrente String 2
      const parseCorrenteString2 = parseFileToChartData(text, 6, "Correte na String");
      setCorrenteString2(parseCorrenteString2);

      // Soma das Correntes das Strings
      const parseCorrenteStringSoma = parseCorrenteString1.map((item, i) => ({
        group: 'Soma das Correntes das Strings',
        key: item.key,
        value: item.value * parseCorrenteString2[i].value,
      }));
      setCorrenteStringsoma(parseCorrenteStringSoma);




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
      
      



      <div className="bg-white text-black grid grid-cols-4 gap-4 p-4 flex flex-col w-[1300px] mx-auto my-5 rounded-lg">
        

        
        <p>Hora Inicial: {correnteMotor?.length > 0
            ? correnteMotor[0].key
            : "Sem dados"
        }
        </p>

        

        <p>Corrente do Motor (Med): {correnteMotor?.length > 0
            ? (correnteMotor.reduce((sum, d) => sum + d.value, 0) / correnteMotor.length).toFixed(3)
            : "Sem dados"
        }
        </p>

        <p>Tensão das Baterias (Med): {tensaoBateria?.length > 0
            ? (tensaoBateria.reduce((sum, d) => sum + d.value, 0) / tensaoBateria.length).toFixed(3)
            : "Sem dados"
        }
        </p>
        
        

        <p>Potência do Motor (Med): {potenciaMotor?.length > 0
            ? (potenciaMotor.reduce((sum, d) => sum + d.value, 0) / potenciaMotor.length).toFixed(3)
            : "Sem dados"
        }
        </p>
        
        <p>Hora Final   : {correnteMotor?.length > 0
            ? correnteMotor[correnteMotor.length - 1].key
            : "Sem dados"
        }
        </p>

        <p>Corrente do Motor (Max): {correnteMotor?.length > 0 
            ? (Math.max(...correnteMotor.map(d => d.value))).toFixed(3)
            : "Sem dados"}
        </p>

        <p>Tensão das Baterias (Max): {tensaoBateria?.length > 0 
            ? (Math.max(...tensaoBateria.map(d => d.value))).toFixed(3)
            : "Sem dados"}
        </p>

        <p>Potência do Motor (Max): {potenciaMotor?.length > 0 
            ? (Math.max(...potenciaMotor.map(d => d.value))).toFixed(3)
            : "Sem dados"}
        </p>

        
        
        

        




      </div>


      


      <div className="flex flex-col gap-y-8 w-[1300px] mx-auto">

      {tensaoBateria ? (
        <Chart data={tensaoBateria} titleChart="Tensão das Baterias"/>
      ) : (
        <p>Carregando dados...</p>
      )}

      {correnteMotor ? (
        <Chart data={correnteMotor} titleChart="Corrente do Motor"/>
      ) : (
        <p>Carregando dados...</p>
      )}

      {potenciaMotor ? (
        <Chart data={potenciaMotor} titleChart="potencia do Motor"/>
      ) : (
        <p>Carregando dados...</p>
      )}

      {correnteString1 ? (
        <Chart data={correnteString1} titleChart="Corrente String 1"/>
      ) : (
        <p>Carregando dados...</p>
      )}

      {correnteString2 ? (
        <Chart data={correnteString2} titleChart="Corrente String 2"/>
      ) : (
        <p>Carregando dados...</p>
      )}

      {correnteStringSoma ? (
        <Chart data={correnteStringSoma} titleChart="Soma das Correntes das Strings"/>
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