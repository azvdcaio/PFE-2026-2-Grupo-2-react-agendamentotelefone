/**
 * Funcionalidades interativas migradas do script.js original.
 * As páginas, seções, cards e links são React; este módulo preserva a validação
 * do formulário de contato já implementada no projeto Vanilla.
 * Falta integração com back-end (o contato ainda não é enviado).
 */
// Um AbortController por montagem remove todos os listeners quando a rota muda.
let activeSignal;
function on(target, type, listener) {
  if (target) target.addEventListener(type, listener, {signal: activeSignal});
}

function apenasNumeros(texto) {
  let numeros = "";
  for (let posicao = 0; posicao < texto.length; posicao++) {
    const caractere = texto[posicao];
    if (caractere >= "0" && caractere <= "9") {
      numeros = numeros + caractere;
    }
  }
  return numeros;
}

// Só letras, espaço, hífen e apóstrofo
function soTemLetras(texto) {
  for (let posicao = 0; posicao < texto.length; posicao++) {
    const caractere = texto[posicao];

    // uma letra muda quando vira maiúscula ou minúscula ("a" e "A"),
    // já números e símbolos continuam iguais ("1" e "1")
    const ehLetra = caractere.toLowerCase() !== caractere.toUpperCase();
    const ehEspaco = caractere === " ";
    const ehHifen = caractere === "-";
    const ehApostrofo = caractere === "'";

    if (!ehLetra && !ehEspaco && !ehHifen && !ehApostrofo) return false;
  }
  return true;
}

// exigirSobrenome = true quando o campo pede "Nome completo" (o contato usa false)
function validarNome(nome, exigirSobrenome) {
  nome = nome.trim();

  if (nome === "") return "Preencha o nome.";
  if (nome.length < 3) return "O nome precisa ter pelo menos 3 letras.";
  if (nome.length > 80) return "O nome está muito longo.";
  if (!soTemLetras(nome)) return "O nome só pode ter letras.";
  if (exigirSobrenome && nome.indexOf(" ") === -1) {
    return "Informe nome e sobrenome.";
  }

  return "";
}

// Sobrenome é opcional: vazio é válido
function validarSobrenome(sobrenome) {
  sobrenome = sobrenome.trim();

  if (sobrenome === "") return "";
  if (sobrenome.length > 80) return "O sobrenome está muito longo.";
  if (!soTemLetras(sobrenome)) return "O sobrenome só pode ter letras.";

  return "";
}

// obrigatorio = false nas páginas de contato (WhatsApp opcional)
function validarWhatsapp(whatsapp, obrigatorio = true) {
  const numeros = apenasNumeros(whatsapp);

  if (numeros === "") return obrigatorio ? "Preencha o WhatsApp." : "";
  if (numeros.length !== 10 && numeros.length !== 11) {
    return "Use o formato (00) 00000-0000.";
  }
  if (numeros[0] === "0" || numeros[1] === "0") return "DDD inválido.";
  if (numeros.length === 11 && numeros[2] !== "9") {
    return "Celular deve começar com 9 depois do DDD.";
  }

  return "";
}

// E-mail é obrigatório
function validarEmail(email) {
  email = email.trim();

  if (email === "") return "Preencha o e-mail.";
  if (email.length > 120) return "E-mail muito longo.";

  const posicaoDoArroba = email.indexOf("@");
  const posicaoDoUltimoPonto = email.lastIndexOf(".");

  const temTextoAntesDoArroba = posicaoDoArroba > 0;
  const temSoUmArroba = email.indexOf("@", posicaoDoArroba + 1) === -1;
  const temPontoDepoisDoArroba = posicaoDoUltimoPonto > posicaoDoArroba + 1;
  const naoTerminaComPonto = posicaoDoUltimoPonto < email.length - 1;
  const naoTemEspaco = email.indexOf(" ") === -1;

  if (
    !temTextoAntesDoArroba ||
    !temSoUmArroba ||
    !temPontoDepoisDoArroba ||
    !naoTerminaComPonto ||
    !naoTemEspaco
  ) {
    return "E-mail inválido. Exemplo: nome@dominio.com";
  }

  return "";
}

// Mensagem + borda vermelha: mensagem no <span data-erro-para="campo">
// e classe "invalido" no campo. Mensagem vazia = campo certo: apaga o erro.
// Devolve true se o campo está certo. "campo" só precisa ser passado
// quando a borda não vai em form.elements[nome] (ex.: grupo de radios).
function mostrarErro(form, nomeDoCampo, mensagem, campo) {
  const spanDeErro = form.querySelector(`[data-erro-para="${nomeDoCampo}"]`);
  campo = campo || form.elements[nomeDoCampo];

  spanDeErro.textContent = mensagem;

  if (mensagem === "") {
    campo.classList.remove("invalido");
    campo.removeAttribute("aria-invalid");
    return true;
  }

  campo.classList.add("invalido");
  campo.setAttribute("aria-invalid", "true");
  return false;
}

// Máscara do WhatsApp: (00) 00000-0000
function aplicarMascaraWhatsapp(campo) {
  on(campo, "input", (evento) => {
    const n = apenasNumeros(evento.target.value).slice(0, 11);

    if (n.length > 10)
      evento.target.value = `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
    else if (n.length > 6)
      evento.target.value = `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`;
    else if (n.length > 2)
      evento.target.value = `(${n.slice(0, 2)}) ${n.slice(2)}`;
    else evento.target.value = n ? `(${n}` : "";
  });
}

/* ==========================================================
  Formulário de contato (contato-pkz.html e contato-one-to-one.html)
   ========================================================== */
function iniciarContato() {
  const form = document.querySelector("[data-form-contato]");
  if (!form) return;

  const erro = form.querySelector(".form-agendamento__erro");
  const sucesso = form.querySelector(".form-agendamento__sucesso");

  function validarMensagem(mensagem) {
    mensagem = mensagem.trim();

    if (mensagem === "") return "Escreva sua mensagem.";
    if (mensagem.length < 10) {
      return "A mensagem precisa ter pelo menos 10 caracteres.";
    }
    if (mensagem.length > 1000) return "Máximo de 1000 caracteres.";
    return "";
  }

  const VALIDADORES = {
    nome: (valor) => validarNome(valor, false),
    sobrenome: validarSobrenome,
    email: validarEmail,
    whatsapp: (valor) => validarWhatsapp(valor, false),
    mensagem: validarMensagem,
  };

  function validarCampo(nomeDoCampo) {
    const valor = form.elements[nomeDoCampo].value;
    return mostrarErro(form, nomeDoCampo, VALIDADORES[nomeDoCampo](valor));
  }

  function validarFormulario() {
    erro.textContent = "";

    // sem curto-circuito: valida todos para mostrar todos os erros de uma vez
    let tudoCerto = true;
    let primeiroComErro = null;

    for (const nomeDoCampo in VALIDADORES) {
      if (!validarCampo(nomeDoCampo)) {
        tudoCerto = false;
        if (primeiroComErro === null) primeiroComErro = nomeDoCampo;
      }
    }

    if (primeiroComErro) form.elements[primeiroComErro].focus();
    return tudoCerto;
  }

  function limparErros() {
    for (const nomeDoCampo in VALIDADORES) mostrarErro(form, nomeDoCampo, "");
    erro.textContent = "";
  }

  async function enviarContato(dados) {
    // TODO: trocar pelo envio real (fetch para o back-end, webhook do n8n...)
    console.log("Contato:", dados);
  }

  // Valida ao sair do campo; depois do primeiro erro, revalida a cada tecla
  for (const nomeDoCampo in VALIDADORES) {
    const campo = form.elements[nomeDoCampo];

    on(campo, "blur", () => validarCampo(nomeDoCampo));
    on(campo, "input", () => {
      sucesso.textContent = "";
      if (campo.classList.contains("invalido")) validarCampo(nomeDoCampo);
    });
  }

  aplicarMascaraWhatsapp(form.elements.whatsapp);

  on(form, "submit", async (evento) => {
    evento.preventDefault();
    sucesso.textContent = "";

    if (!validarFormulario()) return;

    const dados = Object.fromEntries(new FormData(form));
    for (const nomeDoCampo in dados)
      dados[nomeDoCampo] = dados[nomeDoCampo].trim();

    try {
      await enviarContato(dados);
    } catch {
      erro.textContent = "Não foi possível enviar a mensagem. Tente novamente.";
      return;
    }

    form.reset();
    limparErros();
    sucesso.textContent =
      "Mensagem enviada com sucesso! Responderemos o mais rápido possível.";
  });
}



/** Registra os recursos DOM do legado na página atualmente montada. */
export function iniciarInteracoes() {
  const abort = new AbortController();
  activeSignal = abort.signal;
  let iniciouNoFundo = false;
  const pressionar = (event) => { iniciouNoFundo = event.target instanceof HTMLDialogElement; };
  const clicar = (event) => {
    const abrir = event.target.closest("[data-modal-abrir]");
    if (abrir) { document.getElementById(abrir.dataset.modalAbrir)?.showModal(); return; }
    const fechar = event.target.closest("[data-modal-fechar]");
    if (fechar) { fechar.closest("dialog")?.close(); return; }
    if (iniciouNoFundo && event.target instanceof HTMLDialogElement && event.target.classList.contains("modal")) event.target.close();
  };
  document.addEventListener("pointerdown", pressionar, {signal: abort.signal});
  document.addEventListener("click", clicar, {signal: abort.signal});

  iniciarContato();

  return () => {
    abort.abort();
  };
}
