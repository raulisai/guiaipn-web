import { f as current_component, h as ensure_array_like, e as escape_html, i as attr_style, d as attr_class, j as bind_props, c as pop, p as push, k as stringify, l as attr } from "../../../chunks/index.js";
import "clsx";
import { j as fallback } from "../../../chunks/equality.js";
import "../../../chunks/client.js";
function onDestroy(fn) {
  var context = (
    /** @type {Component} */
    current_component
  );
  (context.d ??= []).push(fn);
}
function Examprogres($$payload, $$props) {
  push();
  let progress, answeredQuestions;
  let currentQuestion = $$props["currentQuestion"];
  let totalQuestions = $$props["totalQuestions"];
  let answers = $$props["answers"];
  progress = currentQuestion / totalQuestions * 100;
  answeredQuestions = Object.keys(answers).length;
  const each_array = ensure_array_like(Array(totalQuestions));
  $$payload.out += `<div class="progress-container glow-effect card_color svelte-1yc6ytv"><div class="progress-header svelte-1yc6ytv"><span>Pregunta ${escape_html(currentQuestion)} de ${escape_html(totalQuestions)}</span> <span>${escape_html(answeredQuestions)} respondidas</span></div> <div class="progress-bar-container svelte-1yc6ytv"><div class="progress-bar svelte-1yc6ytv"${attr_style(`width: ${stringify(progress)}%`)}></div></div> <div class="question-indicators svelte-1yc6ytv"><!--[-->`;
  for (let i = 0, $$length = each_array.length; i < $$length; i++) {
    each_array[i];
    $$payload.out += `<div${attr_class("indicator svelte-1yc6ytv", void 0, {
      "current": i + 1 === currentQuestion,
      "answeredCorrect": answers[i + 1] === "true",
      "answeredIncorrect": answers[i + 1] === "false",
      "unanswered": !answers[i + 1] && i + 1 !== currentQuestion
    })}></div>`;
  }
  $$payload.out += `<!--]--></div></div>`;
  bind_props($$props, { currentQuestion, totalQuestions, answers });
  pop();
}
function Timer($$payload, $$props) {
  push();
  let initialSeconds = fallback($$props["initialSeconds"], 0);
  let seconds = initialSeconds;
  let timerInterval;
  let timerColor = "text-custom-teal";
  function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  }
  onDestroy(() => {
    clearInterval(timerInterval);
  });
  $$payload.out += `<div class="relative inline-flex items-center justify-center svelte-qegmye"><div class="relative h-16 w-16 rounded-full bg-slate-800/10 flex items-center justify-center svelte-qegmye"><div class="absolute h-2 w-2 rounded-full bg-blue-400 shadow-blue-300/50 light-orbit svelte-qegmye"></div> <div${attr_class(`h-12 w-12 rounded-full flex items-center justify-center font-medium ${timerColor} bg-slate-800/80 border border-slate-700 text-sm`, "svelte-qegmye")}>${escape_html(formatTime(seconds))}</div></div></div>`;
  bind_props($$props, { initialSeconds });
  pop();
}
function Estadisticas($$payload) {
  $$payload.out += `<div class="flex flex-col mt-16 md:flex-row items-center justify-between gap-6 card_color glow-effect rounded-lg backdrop-blur-sm border border-white/20 py-6 px-4"><div class="timer-circle flex-shrink-0">`;
  Timer($$payload, { initialSeconds: 0 });
  $$payload.out += `<!----></div> <div class="w-full"><h3 class="text-white text-lg font-medium mb-3">Estadísticas de habilidades</h3> <div class="grid grid-cols-2 gap-3"><div class="skill-bar"><div class="flex justify-between mb-1"><span class="text-sm text-white/80">Matemáticas</span> <span class="text-sm text-white/80">75%</span></div> <div class="h-6 relative"><div class="absolute inset-0 bg-white/10" style="clip-path: polygon(0% 0%, 100% 20%, 100% 80%, 0% 100%)"></div> <div class="absolute inset-0 bg-blue-500" style="clip-path: polygon(0% 0%, 75% 20%, 75% 80%, 0% 100%)"></div></div></div> <div class="skill-bar"><div class="flex justify-between mb-1"><span class="text-sm text-white/80">Física</span> <span class="text-sm text-white/80">60%</span></div> <div class="h-6 relative"><div class="absolute inset-0 bg-white/10" style="clip-path: polygon(0% 0%, 100% 20%, 100% 80%, 0% 100%)"></div> <div class="absolute inset-0 bg-green-500" style="clip-path: polygon(0% 0%, 60% 20%, 60% 80%, 0% 100%)"></div></div></div> <div class="skill-bar"><div class="flex justify-between mb-1"><span class="text-sm text-white/80">Química</span> <span class="text-sm text-white/80">80%</span></div> <div class="h-6 relative"><div class="absolute inset-0 bg-white/10" style="clip-path: polygon(0% 0%, 100% 20%, 100% 80%, 0% 100%)"></div> <div class="absolute inset-0 bg-purple-500" style="clip-path: polygon(0% 0%, 80% 20%, 80% 80%, 0% 100%)"></div></div></div> <div class="skill-bar"><div class="flex justify-between mb-1"><span class="text-sm text-white/80">Biología</span> <span class="text-sm text-white/80">45%</span></div> <div class="h-6 relative"><div class="absolute inset-0 bg-white/10" style="clip-path: polygon(0% 0%, 100% 20%, 100% 80%, 0% 100%)"></div> <div class="absolute inset-0 bg-yellow-500" style="clip-path: polygon(0% 0%, 45% 20%, 45% 80%, 0% 100%)"></div></div></div></div></div></div>`;
}
function ModalResponse($$payload, $$props) {
  push();
  let { pregunta, id, iscorrect } = $$props;
  let respuesta = { correcta: "", usuario: "" };
  let showModal = false;
  let explication = void 0;
  let isLoading = false;
  let preguntaAct = pregunta;
  let classTopic = "margin-top: 0px;";
  function toogleModal() {
    showModal = !showModal;
    if (!showModal) {
      classTopic = "margin-top: 0px;";
    }
  }
  async function updateData(respUser, resCorrect) {
    preguntaAct = pregunta;
    respuesta.usuario = respUser;
    respuesta.correcta = resCorrect;
    isLoading = true;
    try {
      explication = await enviarRespuesta(pregunta, respuesta.correcta);
    } catch (error) {
      console.error("Error al obtener la explicación:", error);
    } finally {
      isLoading = false;
      classTopic = "margin-modal";
    }
  }
  async function enviarRespuesta(question, Respuesta) {
    const urlAPI = "https://pqedqxmb2h.execute-api.us-east-2.amazonaws.com/ChatGpt";
    try {
      const response = await fetch(urlAPI, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idreactivo: id,
          respuesta: Respuesta,
          isCorrect: iscorrect,
          pregunta: question
        })
      });
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  }
  if (showModal) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div id="modal" class="fixed inset-0 bg-custom-modal w-full backdrop-blur-md z-50 flex items-center justify-center p-4 svelte-1n5viy1"><div class="basemodal bg-gradient-to-b from-[#04153a] via-[#04153a]/70 to-blue-950 backdrop-blur-sm rounded-xl max-w-[80%] max-h-[90vh] overflow-y-auto p-4 md:p-6 lg:p-8 border border-white/30 svelte-1n5viy1"${attr_style(classTopic)}><div class="mb-4 md:mb-6 svelte-1n5viy1"><div class="flex justify-between items-center mb-3 md:mb-4 svelte-1n5viy1"><h3 class="text-lg md:text-xl font-bold text-white/90 svelte-1n5viy1">Análisis de respuesta</h3> <button class="text-white/70 hover:text-white transition-colors text-xl h-8 w-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 svelte-1n5viy1">✕</button></div> <div class="bg-gradient-to-b from-[#04153a] via-[#030e28]/70 to-sky/60 rounded-lg p-3 md:p-4 border border-white/20 mb-4 svelte-1n5viy1"><div class="mb-3 svelte-1n5viy1"><p class="text-white/80 text-sm md:text-md uppercase mb-1 svelte-1n5viy1">Pregunta</p> <p class="text-white text-secondary svelte-1n5viy1">${escape_html(preguntaAct)}</p></div> <div class="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 svelte-1n5viy1"><div class="bg-blue-900/30 py-2 px-2 md:py-3 rounded border border-blue-400/30 svelte-1n5viy1"><p class="text-blue-300/80 text-sm md:text-sm uppercase mb-1 svelte-1n5viy1">Tu respuesta</p> <p class="text-white text-secondary svelte-1n5viy1">${escape_html(respuesta.usuario)}</p></div> <div class="bg-green-900/30 py-2 px-2 md:py-3 rounded border border-green-400/30 svelte-1n5viy1"><p class="text-green-300/80 text-sm md:text-sm uppercase mb-1 svelte-1n5viy1">Respuesta correcta</p> <p class="text-white text-secondary svelte-1n5viy1">${escape_html(respuesta.correcta)}</p></div></div></div></div> <div class="space-y-4 md:space-y-6 svelte-1n5viy1">`;
    if (isLoading) {
      $$payload.out += "<!--[-->";
      const each_array = ensure_array_like(Array(8));
      $$payload.out += `<div class="flex flex-col justify-center items-center h-80 svelte-1n5viy1"><div class="cyberpulse-loader relative w-80 h-40 svelte-1n5viy1"><div class="absolute inset-0 flex items-center justify-center svelte-1n5viy1"><span class="ring ring-1 svelte-1n5viy1"></span> <span class="ring ring-2 svelte-1n5viy1"></span> <span class="ring ring-3 svelte-1n5viy1"></span></div> <div class="core absolute inset-0 flex items-center justify-center svelte-1n5viy1"><div class="pulse-core svelte-1n5viy1"></div> <div class="scan-line svelte-1n5viy1"></div></div> <div class="orbital-particles svelte-1n5viy1"><!--[-->`;
      for (let i = 0, $$length = each_array.length; i < $$length; i++) {
        each_array[i];
        $$payload.out += `<div class="particle svelte-1n5viy1"${attr_style(`--particle-index: ${stringify(i)}`)}></div>`;
      }
      $$payload.out += `<!--]--></div></div> <p class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500 mt-8 text-lg font-medium tracking-wider glow-text svelte-1n5viy1"><span class="typing-text svelte-1n5viy1">Creando explicacion...</span></p></div>`;
    } else {
      $$payload.out += "<!--[!-->";
      const each_array_1 = ensure_array_like(explication.pasosParaResolverElProblema);
      $$payload.out += `<div class="bg-gradient-to-b from-[#04153a] via-[#030e28]/70 to-sky/60 rounded-lg p-4 md:p-6 border border-white/30 svelte-1n5viy1"><p class="text-white/80 text-sm md:text-lg uppercase mb-2 md:mb-3 svelte-1n5viy1">Explicacion Problema</p> <p class="text-white text-secondary svelte-1n5viy1">${escape_html(explication.explicacionRespuesta)}</p></div> <div class="bg-gradient-to-b from-[#04153a] via-[#030e28]/70 to-sky/60 rounded-lg p-4 md:p-6 border border-white/30 svelte-1n5viy1"><p class="text-white/80 text-sm md:text-lg uppercase mb-2 md:mb-3 svelte-1n5viy1">Tips</p> <p class="text-white text-secondary svelte-1n5viy1">${escape_html(explication.Tip)}</p></div> <div class="bg-gradient-to-b from-[#04153a] via-[#030e28]/70 to-sky/60 rounded-lg p-4 md:p-6 border border-white/30 svelte-1n5viy1"><p class="text-white/80 text-sm md:text-lg uppercase mb-2 md:mb-3 svelte-1n5viy1">Pasos para resolver</p> <div class="text-white text-secondary svelte-1n5viy1"><ol class="list-decimal pl-4 md:pl-6 space-y-2 md:space-y-3 svelte-1n5viy1"><!--[-->`;
      for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
        let paso = each_array_1[i];
        $$payload.out += `<li class="leading-relaxed svelte-1n5viy1">${escape_html(paso)}</li>`;
      }
      $$payload.out += `<!--]--></ol></div></div> <div class="bg-gradient-to-b from-[#04153a] via-[#030e28]/70 to-sky/60 rounded-lg p-4 md:p-6 border border-white/30 svelte-1n5viy1"><h4 class="text-white/80 text-base md:text-lg uppercase mb-2 md:mb-3 svelte-1n5viy1">Formulas</h4> <p class="text-white text-sm md:text-base lg:text-lg svelte-1n5viy1">${escape_html(explication.conceptosORecordatorios)}</p></div> <div class="bg-gradient-to-b from-[#04153a] via-[#030e28]/70 to-sky/60 rounded-lg p-4 md:p-6 border border-white/30 svelte-1n5viy1"><h4 class="text-white/80 text-base md:text-lg uppercase mb-2 md:mb-3 svelte-1n5viy1">Ejemplo</h4> <p class="text-white text-sm md:text-base lg:text-lg svelte-1n5viy1">${escape_html(explication.ejemploSimilar)}</p></div>`;
    }
    $$payload.out += `<!--]--></div></div></div>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { toogleModal, updateData });
  pop();
}
function _page($$payload, $$props) {
  push();
  const totalQuestions = 4;
  let answers = {};
  let currentQuestion = 0;
  let reactivo = {
    id: "exm2024V1Math04",
    currentQuestion: "0",
    pregunta: "cuanto es 2+2",
    iscorrectQuestion: false,
    opciones: []
  };
  const each_array = ensure_array_like(reactivo.opciones);
  $$payload.out += `<div class="mb-20 mt-36 svelte-1hpxgsd"><div class="max-w-6xl px-6 text-center space-y-8 svelte-1hpxgsd"><h1 class="text-5xl font-bold mb-6 relative cyberpunk-title svelte-1hpxgsd"><span class="cyberpunk-title text-transparent bg-clip-text texto-rojo svelte-1hpxgsd">Examen del IPN</span> <span class="block text-3xl mt-1 text-cyan-300 font-light tracking-widest svelte-1hpxgsd">Asistido por IA</span> <div class="absolute -left-2 top-1/2 w-4 h-8 bg-cyan-400/30 blur-sm svelte-1hpxgsd"></div> <div class="absolute -bottom-1 left-0 h-px w-full bg-gradient-to-r from-cyan-500 to-transparent svelte-1hpxgsd"></div></h1> <div class="border-t border-white/20 w-24 mx-auto svelte-1hpxgsd"></div> `;
  Examprogres($$payload, { currentQuestion, totalQuestions, answers });
  $$payload.out += `<!----> <div class="w-full px-6 py-4 rounded-md backdrop-blur-sm border border-white/30 text-white card_color glow-effect svelte-1hpxgsd"><div class="question-container svelte-1hpxgsd"><div class="question-header svelte-1hpxgsd"><span class="question-number svelte-1hpxgsd">Pregunta ${escape_html(reactivo.currentQuestion)}</span> <span class="question-badge svelte-1hpxgsd">Matemáticas</span></div> <div class="question-content svelte-1hpxgsd"><svg class="question-icon svelte-1hpxgsd" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" class="svelte-1hpxgsd"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" class="svelte-1hpxgsd"></path><line x1="12" y1="17" x2="12.01" y2="17" class="svelte-1hpxgsd"></line></svg> <p id="question" class="question-text svelte-1hpxgsd">${escape_html(reactivo.pregunta)}</p></div></div></div> <div class="relative mt-12 mx-auto svelte-1hpxgsd"><div class="grid grid-cols-2 md:grid-cols-4 gap-4 mx-auto mt-12 svelte-1hpxgsd"><!--[-->`;
  for (let index = 0, $$length = each_array.length; index < $$length; index++) {
    let respuesta = each_array[index];
    $$payload.out += `<button class="card card_color glow-effect backdrop-blur-sm border border-white/20 rounded-lg p-4 hover:shadow-lg cursor-pointer transition-all duration-300 min-h-[100px] flex items-center justify-center svelte-1hpxgsd"${attr("id", `btn-${stringify(respuesta.key)}`)}${attr("aria-label", `Respuesta ${stringify(respuesta.key)}`)}><div class="w-full h-full flex flex-col justify-center svelte-1hpxgsd"><span class="text-white font-bold text-lg mb-1 svelte-1hpxgsd">${escape_html(respuesta.key)}</span> <p class="text-white/90 text-sm sm:text-base line-clamp-3 overflow-hidden svelte-1hpxgsd">${escape_html(respuesta.value)}</p></div></button>`;
  }
  $$payload.out += `<!--]--></div></div> `;
  Estadisticas($$payload);
  $$payload.out += `<!----> `;
  ModalResponse($$payload, {
    pregunta: reactivo.pregunta,
    id: reactivo.id,
    iscorrect: reactivo.iscorrectQuestion
  });
  $$payload.out += `<!----> `;
  {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--></div></div>`;
  pop();
}
export {
  _page as default
};
