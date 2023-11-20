import { AiOutlineBarChart, AiOutlineUser } from 'react-icons/ai';
import { FiFolder } from 'react-icons/fi';
import { AiOutlineHome } from 'react-icons/ai';
import { GiShipWheel } from 'react-icons/gi';
import { IoPodiumOutline } from "react-icons/io5";


export const menus = [
  { name: "Home", href: "/", icon: AiOutlineHome },
  { name: "Usuários", href: "/users", icon: AiOutlineUser },
  { name: "Pilotos", href: "/pilots", icon: GiShipWheel },
  { name: "Histórico", href: "/files", icon: FiFolder },
  { name: "Relatórios", href: "/relatorios", icon: AiOutlineBarChart },
  { name: "Classificação", href: "/classificacao", icon: IoPodiumOutline }

];