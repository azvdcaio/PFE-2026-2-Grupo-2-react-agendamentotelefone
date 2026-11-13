import { Link } from "react-router-dom";
import Button from "./Button";
import Layout from "./Layout";
import Secao from "./Secao";
import { empresas } from "../config/siteConfig";

// Agendamento feito direto pelo WhatsApp: destaque para o telefone e um botão de CTA.
export default function Agendamento({ empresa = "pkz" }) {
  const { theme, bodyClass, marca, telefone, telefoneLink, whatsapp, contato } =
    empresas[empresa];

  return (
    <Layout theme={theme} bodyClass={bodyClass} title={`Agendamento | ${marca}`}>
      <Secao className="secao agendamento" aria-labelledby="titulo-agendamento">
        <div className="agendamento__intro">
          <h1 id="titulo-agendamento">{"Agende sua aula experimental"}</h1>
          <p>
            {
              "O agendamento é feito direto com a equipe da " +
              marca +
              ". Chame no WhatsApp e combine o melhor dia e horário."
            }
          </p>
          <ol className="passos">
            <li>
              <span className="passos__numero">{"1"}</span>
              {"Chame a equipe no WhatsApp"}
            </li>
            <li>
              <span className="passos__numero">{"2"}</span>
              {"Combine o dia e o horário da aula"}
            </li>
            <li>
              <span className="passos__numero">{"3"}</span>
              {"Receba a confirmação e venha treinar"}
            </li>
          </ol>
        </div>

        <div className="agendamento__cartao">
          <p className="agendamento__rotulo">{`Fale com a ${marca}`}</p>
          <a className="agendamento__telefone" href={telefoneLink}>
            {telefone}
          </a>
          <Button variant="ciano" href={whatsapp} className="agendamento__cta">
            <i className="fa-brands fa-whatsapp" aria-hidden="true"></i>
            {"Agendar pelo WhatsApp"}
          </Button>
          <p className="agendamento__alternativa">
            {"Prefere ligar? Toque no número acima. Ou "}
            <Link to={contato}>{"envie uma mensagem pelo formulário"}</Link>
            {"."}
          </p>
        </div>
      </Secao>
    </Layout>
  );
}
