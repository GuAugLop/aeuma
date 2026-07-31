// Vocabulário compartilhado entre API, painel e site.

export const CATEGORIAS = [
  { chave: "contas", rotulo: "Prestações de contas" },
  { chave: "contratos", rotulo: "Contratos de transporte" },
  { chave: "termos", rotulo: "Termos e planos de trabalho" },
  { chave: "atas", rotulo: "Atas e deliberações" },
  { chave: "normas", rotulo: "Normas internas" },
];

export const CHAVES_CATEGORIA = CATEGORIAS.map((c) => c.chave);

export const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export function rotuloCategoria(chave) {
  return CATEGORIAS.find((c) => c.chave === chave)?.rotulo || "Documento";
}

// ------------------------------------------------------------ carga inicial
// Cálculos Mensais e Transparência começam VAZIOS — tudo entra pelo painel.
// Itinerários, Diretoria e Estatuto começam com o conteúdo que já estava no ar,
// para o site não ficar em branco. Para zerar também estes: npm run zerar -- --tudo

// [linha, destino, horário, instituições, coordenação]
export const LINHAS_INICIAIS = [
  ["1", "Itapetininga", "17:55", ["Planetec", "Anhanguera", "IIES", "Unopar"], "Lucas Guilherme e Rafaela"],
  ["2", "Itapetininga", "05:45", ["Etec Darcy Pereira", "Instituto Federal"], "Jaine França e Natália Vitória"],
  ["2B", "Itapetininga", "06:25", ["Fatec", "Instituto Federal", "Unifsp"], "Jaine França e Natália Vitória"],
  ["3", "Itapetininga", "18:15", ["FKB"], "Bianca Bueno Corrêa Rochel"],
  ["4", "Itapetininga", "18:00", ["Fatec", "Etec Darcy Pereira"], "Daniele Cristina e Sthefany Vitória"],
  ["5", "Itapetininga", "18:00", ["Instituto Federal", "Unifsp", "Senac", "Ceprom"], "Andressa Pires"],
  ["6", "Itapetininga", "11:00", ["Etec Edson Galvão", "Senac", "Etec Darcy Pereira"], "Thayná Letícia"],
  ["7A", "Itapetininga", "05:50", ["Etec Edson Galvão"], "A confirmar"],
  ["7B", "Itapetininga", "05:50", ["Etec Edson Galvão"], "A confirmar"],
  ["7C", "Itapetininga", "05:50", ["Etec Edson Galvão"], "A confirmar"],
  ["8", "Tauí", "05:15", ["Etec Salles Gomes"], "A confirmar"],
  ["9", "Tauí", "17:35", ["Etec Salles Gomes", "Conservatório", "Fatec", "Faesb"], "Emerson Cardoso"],
  ["10", "Sorocaba", "04:55", ["Unip", "Uniso", "Facens", "Anhanguera", "Fefiso"], "Anna Alice"],
  ["11", "Sorocaba", "16:40", ["Unip", "Uniso", "Facens", "Anhanguera", "Fadi", "Athom"], "Tayara de Souza"],
  ["12", "Buri", "06:55", ["UFSCar"], "Nicole Beatriz e José Eduardo"],
  ["13", "Campina do Monte Alegre", "18:40", ["Etec Extensão Edson Galvão"], "A confirmar"],
  ["14", "Itapetininga", "18:00", ["Etec Edson Galvão"], "Ana Júlia Cardoso"],
];

// [título do setor, descrição, [[nome, cargo], …]]
export const DIRETORIA_INICIAL = [
  ["Diretoria Executiva", "Quem responde institucionalmente pela associação.", [
    ["Gabriel Vinicius dos Santos", "Presidente"],
    ["João Ricardo Pinto dos Santos", "Vice-Presidente"],
  ]],
  ["Tesouraria", "Responsável pela gestão financeira e pelos cálculos mensais.", [
    ["Alexandre Ramos de Oliveira", "1º Tesoureiro"],
    ["Ana Beatriz de Oliveira Lasas", "2ª Tesoureira"],
  ]],
  ["Secretaria", "Atas, registros e comunicação oficial da AEUMA.", [
    ["Paulo Gabriel Bezerra da Silva", "1º Secretário"],
    ["Giovana Borba Ferreira", "2ª Secretária"],
  ]],
  ["Conselho Fiscal", "Fiscaliza contas, contratos e prestações de contas.", [
    ["Antônio Celso Rodrigues", "Presidente do Conselho"],
    ["Pedro Augusto dos Santos Bezerra", "1º Conselheiro"],
    ["Carla Roberta Camargo Bueno", "2ª Conselheira"],
  ]],
  ["Apoio Administrativo", "Atendimento ao estudante no dia a dia.", [
    ["Bianca Aparecida Santos Silva", "Assistente Administrativo"],
    ["Juliana Cristina Pereira", "Assistente Administrativo"],
  ]],
];

export const ESTATUTO_INICIAL = {
  titulo: "Estatuto Social da AEUMA",
  resumo:
    "Versão vigente, na íntegra, em PDF. Leia antes de se associar ou de se candidatar a um cargo da diretoria.",
  url: "https://www.aeuma.com/estatuto/arquivoEstatuto.pdf",
  arquivo: null,
  topicos: [
    ["Finalidade", "Representar os estudantes universitários de Angatuba e viabilizar o transporte até as instituições de ensino."],
    ["Associados", "Quem pode se associar, direitos, deveres e hipóteses de desligamento."],
    ["Assembleia Geral", "Órgão máximo da associação: convocação, quórum e matérias de sua competência."],
    ["Diretoria e Conselho Fiscal", "Composição, mandato, atribuições de cada cargo e processo de eleição."],
    ["Patrimônio e prestação de contas", "Origem dos recursos, aplicação e obrigação de publicidade das contas."],
    ["Disposições gerais", "Alteração do estatuto, dissolução e destinação do patrimônio."],
  ],
};
