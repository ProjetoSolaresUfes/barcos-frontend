import ThemeToggle from '@/components/ThemeToggle';
import { useState } from 'react';

const initialTeamData = [
  { id: 1, name: 'Equipe A', initialPoints: 200, points: 200, isDNS: false, isDNF: false },
  { id: 2, name: 'Equipe B', initialPoints: 200, points: 200, isDNS: false, isDNF: false },
  { id: 3, name: 'Equipe C', initialPoints: 200, points: 200, isDNS: false, isDNF: false },
  { id: 4, name: 'Equipe D', initialPoints: 200, points: 200, isDNS: false, isDNF: false },
  { id: 5, name: 'Equipe E', initialPoints: 200, points: 200, isDNS: false, isDNF: false },
  { id: 6, name: 'Equipe F', initialPoints: 200, points: 200, isDNS: false, isDNF: false },
  { id: 7, name: 'Equipe G', initialPoints: 200, points: 200, isDNS: false, isDNF: false },
  { id: 8, name: 'Equipe H', initialPoints: 200, points: 200, isDNS: false, isDNF: false },
  { id: 9, name: 'Equipe I', initialPoints: 200, points: 200, isDNS: false, isDNF: false },
  { id: 10, name: 'Equipe J', initialPoints: 200, points: 200, isDNS: false, isDNF: false },
  { id: 11, name: 'Equipe K', initialPoints: 200, points: 200, isDNS: false, isDNF: false },
  { id: 12, name: 'Equipe L', initialPoints: 200, points: 200, isDNS: false, isDNF: false },
  { id: 13, name: 'Equipe M', initialPoints: 200, points: 200, isDNS: false, isDNF: false },
];

const LeaderboardTable = () => {
  const [teams, setTeams] = useState(initialTeamData);

  const handleCheckboxChangeDNS = (teamId: number) => {
    const updatedTeams = teams.map((team) =>
      team.id === teamId ? { ...team, isDNS: !team.isDNS } : team
    );
    setTeams(updatedTeams);
  };

  const handleCheckboxChangeDNF = (teamId: number) => {
    const updatedTeams = teams.map((team) =>
      team.id === teamId ? { ...team, isDNF: !team.isDNF } : team
    );
    setTeams(updatedTeams);
  };
  
  const teamPointsTable = teams.map((team) => {
    let points = team.initialPoints;

    if (team.isDNS) {
      points -= 10;
    }
    if (team.isDNF) {
      points -= 200;
    }
    if (points < 0) {
      points = 0;
    }

    return {
      id: team.id,
      name: team.name,
      points: points,
    };
  });

  const sortedTeams = [...teams].sort((a, b) => b.points - a.points);
  const sortedTeamPoints = teamPointsTable.sort((a, b) => b.points - a.points);

  return (
    <div className="bg-slate flex flex-col max-w-full h-1/2 rounded-md shadow-xl p-4">
          <div>
            <div>
                <ThemeToggle />
            </div>
            <div className="bg-slate flex flex-col max-w-full shadow-xl p-4">
                <table >
                    <thead>
                    <tr className="bg-gray-500">
                        <th className="border border-gray-900 p-2">Equipe</th>
                        <th className="border border-gray-900 p-2">DNS</th>
                        <th className="border border-gray-900 p-2">DNF</th>
                    </tr>
                    </thead>
                    <tbody>
                    {sortedTeams.map((team) => (
                        <tr key={team.id} className="bg-gray-400">
                        <td className="border border-gray-900 p-2">{team.name}</td>
                        <td className="border border-gray-900 p-2">
                            <input
                            type="checkbox"
                            checked={team.isDNS}
                            onChange={() => handleCheckboxChangeDNS(team.id)}
                            />
                        </td>
                        <td className="border border-gray-900 p-2">
                            <input
                            type="checkbox"
                            checked={team.isDNF}
                            onChange={() => handleCheckboxChangeDNF(team.id)}
                            />
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>    
        </div>   
        <div className="bg-slate flex flex-col max-w-full shadow-xl p-4">
       
        <div className="overflow-y-auto max-h-60 flex justify-center">
        <table>
       
            <thead>
                <tr className="bg-gray-500">
                <th className="border border-gray-900 p-2">Equipe</th>
                <th className="border border-gray-900 p-2">Pontos</th>
                </tr>
            </thead>
            <tbody>
                {sortedTeamPoints.slice(0, 13).map((team, index) => (
                <tr key={team.id} className="bg-gray-400">
                    <td className="border border-gray-900 p-2">{team.name}</td>
                    <td className="border border-gray-900 p-2">{team.points}</td>
                </tr>
                ))}
            </tbody>
        </table>
        </div>        
        
        </div>

    </div> 




  );
};

export default LeaderboardTable;
