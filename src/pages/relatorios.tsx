import { getFile, listFiles } from "@/firebase/functions/storage";
import { orderBy } from "lodash";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { Chart } from "@/components/Chart";
import { ChartData, DadosBarco } from "@/types/ChartData";
import { transformDataChart } from "@/utils/chart";
import { useEffect, useState } from "react";


export default function Relatorios() {
  //User States
  const [files, setFiles] = useState<any>([]);
  const searchParams = useSearchParams();
	const [selectedOption, setSelectedOption] = useState<string>("");
  const [fileContent, setFileContent] = useState<string>("");
  const [chartData, setChartData] = useState<ChartData>([]);
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

  //Função para pegar os dados do arquivo e converter para o chartdata
  function parseFileToChartData(fileContent: string, multiplier: number, description: string): ChartData  {
  const lines = fileContent.trim().split("\n");

  const data: ChartData = lines
    .map((line) => {
      
      const cols = line.trim().split(",");        //Separando as colunas
      if (cols.length < 12) return null;          //Verificando numero de Colunas

      //1,229.48,164.04,-1.00,-1.00,0.00,9.46,9.60,49.45,80.52,18.80,0,24/07/2024 13:35:22,Pizzol

      //Separa a Hora, valores de hora serão eixo x do gráfico
      const horaCompleta = cols[cols.length - 2];    // pega a coluna   : "02/08/2023 13:29:03"
      const hora = horaCompleta.split(" ")[1];       // extrai só a hora: "13:29:03"

      const corrente = parseFloat(cols[multiplier]); // pega o valor da coluna que foi passado
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

      //Obtendo Arquivo escolhido
      const response = await fetch(url);
      const text = await response.text();
      setFileContent(text);

      // Verificando quantidade de Medições
      const numMedicoes = text.split('\n').length;
      
      //Reduzindo a quantidade de pontos no gráfico
      let fatorDeReducao = 1;
      if(numMedicoes >= 600) fatorDeReducao = 3;  //Registra a cada 3 segundos

      //tensaoSaidaMPPT
      const parseTensaoBateria = parseFileToChartData(text, 7, "Tensão na Bateria").filter((_, index) => index % fatorDeReducao === 0);
      setTensaoBateria(parseTensaoBateria);
      
      //CorrenteMotor
      const parseCorrenteMotor = parseFileToChartData(text, 0, "Corrente no Motor").filter((_, index) => index % fatorDeReducao === 0);
      setCorrenteMotor(parseCorrenteMotor);

      // PotenciaMotor = TensaoSaidaMPPT * CorrenteMotor
      const parsePotenciaMotor = parseTensaoBateria.map((item, i) => ({
        group: 'Potencia do motor',
        key: item.key,
        value: item.value * parseCorrenteMotor[i].value,
      }));
      setPotenciaMotor(parsePotenciaMotor);

      //Velocidade
      //const parseVelocidade = parseFileToChartData(text, 3, "Velocidade");
      //setVelocidade(parseVelocidade);

      //Corrente String 1
      const parseCorrenteString1 = parseFileToChartData(text, 5, "Correte na String").filter((_, index) => index % fatorDeReducao === 0);
      setCorrenteString1(parseCorrenteString1);

      //Corrente String 2
      const parseCorrenteString2 = parseFileToChartData(text, 6, "Correte na String").filter((_, index) => index % fatorDeReducao === 0);
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