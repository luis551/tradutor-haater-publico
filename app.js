(function () {
  function normalize(value) {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizeCode(value) {
    return normalize(value).replace(/[^a-z0-9]/g, "");
  }

  async function sha256Hex(value) {
    const buffer = new TextEncoder().encode(value);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(function (byte) {
      return byte.toString(16).padStart(2, "0");
    }).join("");
  }

  const STORAGE_KEY = "haater_progress_v3";
  const LOCKED_TOKEN = "[oculto]";
  const TOKEN_RE = /[\p{L}\p{M}']+|[0-9]+|[^\s\p{L}\p{N}]/gu;

  const FRAGMENTS = [
    {
      id: "base",
      title: "Memoria Inicial",
      sealedTitle: "memoria basal",
      hint: "Restos basicos que o tradutor ainda lembra sozinho.",
      sealedHint: "O volume ainda guarda alguns termos por conta propria.",
      code: null,
      auto: true,
      words: ["khar", "na", "ik", "sa", "saar", "drath", "kael", "thal", "morn", "vel", "zor", "vior"],
      libraryLabel: "memoria basal",
      libraryNote: "O artefato ainda sabe diferenciar pedra, sombra, sangue, metal e chama.",
      reward: "O resto mais antigo ainda respira.",
      lockedToken: "[fragmento ausente]",
      pages: [
        {
          id: "base-1",
          folio: "folio I",
          title: "resto basal",
          excerpt: "khar | saar | drath | kael | morn | thal",
          annotation: "Nota de margem: a memoria mais antiga ainda segura pedra, chama, sangue e sombra. O volume acordou por essas palavras primeiro.",
          studyTriggers: []
        }
      ]
    },
    {
      id: "stone",
      title: "Tabua da Pedra",
      sealedTitle: "folha sem titulo I",
      hint: "Peso, resto e permanencia.",
      sealedHint: "A cabeca foi riscada. Restos de peso e permanencia ainda presos aqui.",
      unlockHashes: [
        "9c92c6b6fba006f0477fe4a017fa9b255bc99595d653fd9c3ca8b0568e668a96",
        "1e5de2ce56ad4700b0ad161d76b2bdfd0827b94f7f12407ed3f7abfa1feb78ba"
      ],
      words: ["reth", "thur", "ruun", "en", "va", "marth"],
      libraryLabel: "tabua recuperada",
      libraryNote: "A escrita volta a distinguir resto, base e permanencia. O texto fica menos cego para materia.",
      reward: "Sangue, pedra e brasa agora cabem na mesma memoria.",
      lockedToken: "[peso desconhecido]",
      pages: [
        {
          id: "stone-1",
          folio: "folio I",
          title: "peso que permaneceu",
          excerpt: "Kael en drath.\nReth thur.",
          annotation: "Nota de margem: sangue, pedra e brasa aparecem como a mesma prova. Aqui permanencia nao e virtude; e materia.",
          studyTriggers: [
            "Kael en drath.",
            "Sangue na pedra.",
            "Reth thur.",
            "A brasa permanece."
          ]
        },
        {
          id: "stone-2",
          folio: "folio II",
          title: "o resto nao cede",
          excerpt: "Saar thur.\nRuun aer.",
          annotation: "Nota de margem: chama e ruina nao surgem como opostos. O manuscrito trata ambas como estados que ficam sobre a base.",
          studyTriggers: [
            "Saar thur.",
            "A chama permanece.",
            "Ruun aer.",
            "A ruina veio."
          ]
        }
      ]
    },
    {
      id: "name",
      title: "Tabua do Nome",
      sealedTitle: "margem sem nome II",
      hint: "A voz retorna tarde.",
      sealedHint: "O nome foi apagado na beira da folha. Ainda ha eco demais aqui.",
      unlockHashes: [
        "8f1cb7279bcaa5a151231a27e27ce869de1252649c440df4e1efe5ab81592c1b",
        "bb3614ccacc20c62224337c5ff23864e4f945dbfa9afce6ea23280cea155875f"
      ],
      words: ["esh", "sorn", "tavar", "veth", "sile", "sen", "neth"],
      libraryLabel: "tabua recuperada",
      libraryNote: "O texto aprende a reconhecer o nome quando ele volta errado. A leitura fica mais perigosa.",
      reward: "O nome voltou pesado demais.",
      lockedToken: "[nome lacrado]",
      pages: [
        {
          id: "name-1",
          folio: "folio I",
          title: "o nome ja caiu",
          excerpt: "Esh khar.\nNa zor esh.",
          annotation: "Nota de margem: o manuscrito nao descreve o nome como identidade limpa. Ele pesa, falha e pode cair antes do corpo.",
          studyTriggers: [
            "Esh khar.",
            "O nome caiu.",
            "Na zor esh.",
            "Nao vejo o nome."
          ]
        },
        {
          id: "name-2",
          folio: "folio II",
          title: "retorno fora de hora",
          excerpt: "Tor aer va esh, vara.\nVek esh aer va neth, sile.",
          annotation: "Nota de margem: nao responder depressa. O texto insiste em retorno e atraso, como se o perigo viesse pela repeticao.",
          studyTriggers: [
            "Tor aer va esh, vara.",
            "Ao segundo retorno do nome, espere.",
            "Vek esh aer va neth, sile.",
            "Se teu nome vier do silencio, cale."
          ]
        },
        {
          id: "name-3",
          folio: "folio III",
          title: "devolucao negada",
          excerpt: "Oren esh falha, reku.\nNurk sen esh ao morn.",
          annotation: "Nota de margem: a instrucao e negativa do inicio ao fim. O nome nao deve ser devolvido quando ja soa longe demais.",
          studyTriggers: [
            "Oren esh falha, reku.",
            "Onde teu nome falhar, recue.",
            "Nurk sen esh ao morn.",
            "Nunca devolva teu nome ao escuro."
          ]
        }
      ]
    },
    {
      id: "interval",
      title: "Tabua do Intervalo",
      sealedTitle: "costura fria III",
      hint: "Frio, ferida e o que vem antes.",
      sealedHint: "A folha range como se escondesse um tempo anterior ao golpe.",
      unlockHashes: [
        "1d82364a7428e54bc4f28b4e86420e31847f5322ec6c4854d936d06995e690a6",
        "e29595b59719fc17113f8b29b7d92243dcab0c4eb063ef0a67bbf6f9e623243d"
      ],
      words: ["hela", "preth", "gath", "talm", "ora", "aer", "vara"],
      libraryLabel: "tabua recuperada",
      libraryNote: "A linguagem aprende a falar do antes. O perigo deixa de morar no golpe e passa a morar no intervalo.",
      reward: "O frio chegou antes da ferida.",
      lockedToken: "[intervalo perdido]",
      pages: [
        {
          id: "interval-1",
          folio: "folio I",
          title: "frio antes da dor",
          excerpt: "Hela aer preth va talm.\nKhar aer preth va gath.",
          annotation: "Nota de margem: a escrita afasta a morte do instante final. Ela age no que antecede, no que chega cedo demais.",
          studyTriggers: [
            "Hela aer preth va talm.",
            "O frio entra antes da dor.",
            "Khar aer preth va gath.",
            "A queda comeca antes do golpe."
          ]
        },
        {
          id: "interval-2",
          folio: "folio II",
          title: "o golpe vem tarde",
          excerpt: "Preth va gath, hela aer.\nKhar vara.",
          annotation: "Nota de margem: o manuscrito volta sempre a mesma visao. O golpe nao inicia nada. Quando ele vem, a certeza ja estava feita.",
          studyTriggers: [
            "Preth va gath, hela aer.",
            "Antes do golpe, o frio vem.",
            "Khar vara.",
            "A morte espera."
          ]
        }
      ]
    },
    {
      id: "root",
      title: "Tabua da Raiz",
      sealedTitle: "brasa afundada IV",
      hint: "Memoria, sonho e coisa presa no fundo.",
      sealedHint: "A brasa afundou demais. Ainda ha memoria presa sob a costura.",
      unlockHashes: [
        "10e04d348004abd8612ab76b7f838174d9f9fa180ed6c1fe079b7daa25b5b433",
        "e4e31ca43532cf3b82d599bcff94e0c2dce7cf30471e596233b59242c021b8e6"
      ],
      words: ["sava", "veyr", "vahr", "drael", "orun", "dren"],
      libraryLabel: "tabua recuperada",
      libraryNote: "A brasa deixa de ser so resto. Ela passa a lembrar. O fundo do texto comeca a puxar de volta.",
      reward: "Nem tudo que afundou soltou o mundo.",
      lockedToken: "[raiz oculta]",
      pages: [
        {
          id: "root-1",
          folio: "folio I",
          title: "lembranca acesa",
          excerpt: "Ik sava saar.\nReth sava. Veyr dren.",
          annotation: "Nota de margem: quando a brasa lembra, ela ja nao e so resto. O termo de raiz sugere algo preso no fundo que continua puxando.",
          studyTriggers: [
            "Ik sava saar.",
            "Eu lembro da chama.",
            "Reth sava. Veyr dren.",
            "A brasa lembra. A raiz puxa."
          ]
        },
        {
          id: "root-2",
          folio: "folio II",
          title: "o fundo nao soltou",
          excerpt: "Reth sava.\nVeyr dren.",
          annotation: "Nota de margem: o manuscrito liga memoria a tracao. Nao e recordar por saudade. E ser puxado por algo que ficou enterrado.",
          studyTriggers: [
            "Reth sava.",
            "A brasa lembra.",
            "Veyr dren.",
            "A raiz puxa."
          ]
        }
      ]
    },
    {
      id: "book1",
      title: "Livro I // Rethen va Thur",
      sealedTitle: "caderno queimado VII",
      hint: "Brasas, infancia, noite e o que ainda nao caiu.",
      sealedHint: "As bordas queimaram. O titulo ainda nao voltou inteiro.",
      unlockHashes: [
        "9c15965436cfa0836e103c78653023f3d4f6857b11259f067a20fccb58f0a697",
        "783581a085e48c2203626cf0983d97cbb001aa9cab71fb07e558b1374799a00c"
      ],
      words: ["rethen", "ith", "tir", "drae", "zora"],
      libraryLabel: "livro recuperado",
      libraryNote: "As lembrancas mais antigas de Solin voltam pela brasa: infancia, peso, ruina e sobrevivencia.",
      reward: "As brasas nao cairam. Alguem ficou.",
      lockedToken: "[memoria partida]",
      pages: [
        {
          id: "book1-1",
          folio: "folio I",
          title: "a chama lembrada",
          excerpt: "Ik sava saar.\nIk sava ruun.\nRethen na khar.",
          annotation: "Nota de margem: a primeira lembranca nao e um rosto. E chama, ruina e o resto que nao tombou.",
          studyTriggers: [
            "Ik sava saar.",
            "Eu lembro da chama.",
            "Ik sava ruun.",
            "Eu lembro da ruina.",
            "Rethen na khar.",
            "As brasas nao cairam."
          ]
        },
        {
          id: "book1-2",
          folio: "folio II",
          title: "quando ainda era pequeno",
          excerpt: "Ik ith.\nTir sen.\nDrath drae.",
          annotation: "Nota de margem: o livro mede infancia por peso e tamanho da noite. O mundo aparece maior que a propria voz.",
          studyTriggers: [
            "Ik ith.",
            "Eu era pequeno.",
            "Tir sen.",
            "A noite era grande.",
            "Drath drae.",
            "A pedra pesava."
          ]
        },
        {
          id: "book1-3",
          folio: "folio III",
          title: "cedo demais",
          excerpt: "Kael en drath.\nMorn en saar.\nVel khar cedo.",
          annotation: "Nota de margem: sangue, sombra e chama aparecem juntos. A vida cai cedo antes que o texto ofereca qualquer explicacao.",
          studyTriggers: [
            "Kael en drath.",
            "Sangue na pedra.",
            "Morn en saar.",
            "Sombra na chama.",
            "Vel khar cedo.",
            "A vida caiu cedo."
          ]
        },
        {
          id: "book1-4",
          folio: "folio IV",
          title: "nomes que nao ficaram",
          excerpt: "Esh nar khar.\nVoz nar na thur.\nSo eco.",
          annotation: "Nota de margem: nao e so morte de corpo. O livro registra queda de nome e perda de voz. O resto que sobra e eco.",
          studyTriggers: [
            "Esh nar khar.",
            "Os nossos nomes cairam.",
            "Voz nar na thur.",
            "As vozes nao ficaram.",
            "So eco.",
            "So o eco."
          ]
        },
        {
          id: "book1-5",
          folio: "folio V",
          title: "uma mao fechou o silencio",
          excerpt: "Sa mao dren ik.\nSa mao fecha ik.\nIk na grita.",
          annotation: "Nota de margem: ha acao de outra mao, mas sem rosto. O silencio e imposto antes do grito.",
          studyTriggers: [
            "Sa mao dren ik.",
            "Uma mao me arrancou dali.",
            "Sa mao fecha ik.",
            "Uma mao me fechou em silencio.",
            "Ik na grita.",
            "Eu nao gritei."
          ]
        },
        {
          id: "book1-6",
          folio: "folio VI",
          title: "a ruina atras",
          excerpt: "Ik corre.\nDrath na abre.\nRuun aer atras.",
          annotation: "Nota de margem: nao ha saida pela terra. A ruina vem por tras, constante, como se ja soubesse o caminho.",
          studyTriggers: [
            "Ik corre.",
            "Eu corri.",
            "Drath na abre.",
            "A terra nao se abriu.",
            "Ruun aer atras.",
            "A ruina vinha atras."
          ]
        },
        {
          id: "book1-7",
          folio: "folio VII",
          title: "resposta de sangue",
          excerpt: "Saar sobe.\nMorn come.\nKael responde.",
          annotation: "Nota de margem: a imagem e curta e brutal. O manuscrito narra por gesto e materia, nunca por explicacao moderna.",
          studyTriggers: [
            "Saar sobe.",
            "A chama subiu.",
            "Morn come.",
            "A sombra engoliu.",
            "Kael responde.",
            "O sangue respondeu."
          ]
        },
        {
          id: "book1-8",
          folio: "folio VIII",
          title: "o fim sem rostos",
          excerpt: "Ik sava na rosto.\nIk sava na esh.\nMas ik sava fim.",
          annotation: "Nota de margem: rostos e nomes somem primeiro. O fim e o unico ponto firme que resta na memoria.",
          studyTriggers: [
            "Ik sava na rosto.",
            "Eu nao lembro dos rostos.",
            "Ik sava na esh.",
            "Eu nao lembro dos nomes.",
            "Mas ik sava fim.",
            "Mas eu lembro do fim."
          ]
        },
        {
          id: "book1-9",
          folio: "folio IX",
          title: "os antigos cairam",
          excerpt: "Ur nar khar.\nRethen nar thur.\nIk thur.",
          annotation: "Nota de margem: os antigos caem, a brasa fica e Solin permanece. O verbo de permanencia volta como resto de sobrevivencia.",
          studyTriggers: [
            "Ur nar khar.",
            "Os antigos cairam.",
            "Rethen nar thur.",
            "As brasas ficaram.",
            "Ik thur.",
            "Eu fiquei."
          ]
        },
        {
          id: "book1-10",
          folio: "folio X",
          title: "so o rastro",
          excerpt: "Se sa zora varn,\nzora rastro.\nNa verdade. So brasa.",
          annotation: "Nota de margem: o proprio livro avisa que nao entrega verdade inteira. Ele oferece apenas rastro e brasa.",
          studyTriggers: [
            "Se sa zora varn, zora rastro.",
            "Se alguem encontrar este escrito, encontrara um rastro.",
            "Na verdade. So brasa.",
            "Nao a verdade. So a brasa."
          ]
        }
      ]
    },
    {
      id: "book2",
      title: "Livro II // Varn va Thal Vior",
      sealedTitle: "caderno violeta VIII",
      hint: "Memorias exatas da armadura roxa e do que ela guarda.",
      sealedHint: "O couro da capa ficou, mas o titulo segue preso no metal.",
      unlockHashes: [
        "8ac5ffc08112ff6bdf10d870f95aee5d271aeb481b0341e4d32ae6dc8b6aef1b",
        "bd7bce7eaa7d4ceb5c5b3e48427ee62ecfa333b11c42f951fbc7f151773bda3e"
      ],
      words: [],
      libraryLabel: "livro recuperado",
      libraryNote: "A armadura roxa deixa de ser figura. Ela vira testemunho, peso guardado e sinal de permanencia.",
      reward: "O metal respondeu antes da voz.",
      lockedToken: "[metal sem voz]",
      pages: [
        {
          id: "book2-1",
          folio: "folio I",
          title: "quem guarda quem",
          excerpt: "Thal na guarda ik.\nIk guarda thal.",
          annotation: "Nota de margem: a relacao com a armadura inverte protecao e peso. Nao e abrigo. E guarda mutua.",
          studyTriggers: [
            "Thal na guarda ik.",
            "A armadura nao me guarda.",
            "Ik guarda thal.",
            "Eu e que guardo a armadura."
          ]
        },
        {
          id: "book2-2",
          folio: "folio II",
          title: "o metal fala antes",
          excerpt: "Ur, thal era peso.\nAgora, thal fala antes de ik.",
          annotation: "Nota de margem: o metal deixa de ser objeto. Passa a responder no lugar da voz.",
          studyTriggers: [
            "Ur, thal era peso.",
            "Antes, ela era peso.",
            "Agora, thal fala antes de ik.",
            "Agora, fala antes de mim."
          ]
        },
        {
          id: "book2-3",
          folio: "folio III",
          title: "o roxo faz recuar",
          excerpt: "Sa zora vior,\nsa recua.\nSa cala.",
          annotation: "Nota de margem: o violeta funciona como aviso antes de nome ou forma. Quem ve, recua e se cala.",
          studyTriggers: [
            "Sa zora vior, sa recua.",
            "Quem ve o roxo, recua.",
            "Sa cala.",
            "Se cala."
          ]
        },
        {
          id: "book2-4",
          folio: "folio IV",
          title: "antes do nome",
          excerpt: "Ik na sava o que veem.\nMas veem algo.\nAntes de esh.",
          annotation: "Nota de margem: a percepcao dos outros para antes do nome. O volume insiste que alguma coisa chega primeiro.",
          studyTriggers: [
            "Ik na sava o que veem.",
            "Eu nao sei o que enxergam.",
            "Mas veem algo.",
            "Mas enxergam alguma coisa.",
            "Antes de esh.",
            "Antes do nome."
          ]
        },
        {
          id: "book2-5",
          folio: "folio V",
          title: "o metal permanece",
          excerpt: "Kael seca.\nReth dorme.\nThal thur.",
          annotation: "Nota de margem: sangue seca, brasa dorme e o metal fica. Permanencia aqui tem cara de armadura e nao de paz.",
          studyTriggers: [
            "Kael seca.",
            "O sangue seca.",
            "Reth dorme.",
            "A brasa dorme.",
            "Thal thur.",
            "O metal permanece."
          ]
        },
        {
          id: "book2-6",
          folio: "folio VI",
          title: "agora escuta pedra",
          excerpt: "Ur ik corria.\nUr ik falava mais.\nAgora ik escuta pedra.",
          annotation: "Nota de margem: o passado e medido por corrida e fala. O presente e pedra escutada, como se o mundo falasse mais que o corpo.",
          studyTriggers: [
            "Ur ik corria.",
            "Antes eu corria.",
            "Ur ik falava mais.",
            "Antes eu falava mais.",
            "Agora ik escuta pedra.",
            "Agora eu escuto a pedra."
          ]
        },
        {
          id: "book2-7",
          folio: "folio VII",
          title: "a sombra como sinal",
          excerpt: "Morn anda com ik.\nNa como dona.\nComo sinal.",
          annotation: "Nota de margem: a sombra nao domina, mas acompanha. O livro trata a sombra como aviso constante e nao como entidade total.",
          studyTriggers: [
            "Morn anda com ik.",
            "A sombra anda comigo.",
            "Na como dona.",
            "Nao como dona.",
            "Como sinal.",
            "Como sinal."
          ]
        },
        {
          id: "book2-8",
          folio: "folio VIII",
          title: "os anos entram",
          excerpt: "Anos na levam ik.\nAnos entram ik.\nFicam.",
          annotation: "Nota de margem: o tempo nao leva Solin embora. Ele entra e fica, como ferrugem, peso ou resto preso.",
          studyTriggers: [
            "Anos na levam ik.",
            "Os anos nao me levam.",
            "Anos entram ik.",
            "Os anos entram em mim.",
            "Ficam.",
            "E ficam."
          ]
        },
        {
          id: "book2-9",
          folio: "folio IX",
          title: "nao perguntar o nome",
          excerpt: "Sa chama.\nSa teme.\nIk na pergunto esh.",
          annotation: "Nota de margem: alguns chamam, alguns temem, mas o texto recusa a pergunta principal. O nome nao e tratado como resposta segura.",
          studyTriggers: [
            "Sa chama.",
            "Alguns chamam.",
            "Sa teme.",
            "Alguns temem.",
            "Ik na pergunto esh.",
            "Eu nao pergunto o nome."
          ]
        },
        {
          id: "book2-10",
          folio: "folio X",
          title: "o que ficou",
          excerpt: "Thal vior na e gloria.\nNa e paz.\nE so o que ficou.",
          annotation: "Nota de margem: o fechamento recusa gloria e paz. A armadura roxa e apenas o resto que sobreviveu a tudo.",
          studyTriggers: [
            "Thal vior na e gloria.",
            "A armadura roxa nao e gloria.",
            "Na e paz.",
            "Nao e paz.",
            "E so o que ficou.",
            "E so o que ficou."
          ]
        }
      ]
    },
    {
      id: "body",
      title: "Tabua do Corpo",
      sealedTitle: "forma raspada V",
      hint: "Forma, rosto, aviso e recuo.",
      sealedHint: "A forma foi raspada da folha. So restou o aviso.",
      unlockHashes: [
        "c535a13d32ef820a6e952db5ac4d4e2a4494ad31860d52b2fe86d56eb9c25b20",
        "503789a00b111479b252b9499a0d4a6c0fca0c197fa21158d3d58e720f1184f9"
      ],
      words: ["raan", "fara", "kor", "anar", "boka", "seln", "reku", "oren"],
      libraryLabel: "tabua recuperada",
      libraryNote: "O artefato aprende a desconfiar da forma. Rosto e aparencia deixam de ser prova suficiente.",
      reward: "Nao pelo rosto. Pelo vazio.",
      lockedToken: "[forma ausente]",
      pages: [
        {
          id: "body-1",
          folio: "folio I",
          title: "nao pelo rosto",
          excerpt: "Seln esh como na ik.\nNa pelo raan. Pelo shel.",
          annotation: "Nota de margem: o corpo deixa de ser guia. O vazio vale mais que a face quando o texto tenta reconhecer perigo.",
          studyTriggers: [
            "Seln esh como na ik.",
            "Escute o nome como se nao fosse teu.",
            "Na pelo raan. Pelo shel.",
            "Nao pelo rosto. Pelo vazio."
          ]
        },
        {
          id: "body-2",
          folio: "folio II",
          title: "recuo sem resposta",
          excerpt: "Oren esh falha, reku.\nLar esh khar en sorn orun.",
          annotation: "Nota de margem: quando o nome falha, o texto pede recuo. Se ele ja caiu, deve cair sozinho no eco, sem resposta de volta.",
          studyTriggers: [
            "Oren esh falha, reku.",
            "Onde teu nome falhar, recue.",
            "Lar esh khar en sorn orun.",
            "Deixe teu nome morrer sozinho no eco."
          ]
        }
      ]
    },
    {
      id: "certainty",
      title: "Tabua da Certeza",
      sealedTitle: "nota final VI",
      hint: "Confirmacao, retorno e fixidez.",
      sealedHint: "Quase tudo foi raspado. So ficou o fechamento do ritual.",
      unlockHashes: [
        "5b988d7cef67582fe394140524b70d8b4de74d67a7f2f9a9ed83338ad4a685bb",
        "37c0fb435481ea85ee0f696d71d3604556d3b7eeda0ad982301ff398fdfd0e01"
      ],
      words: ["keth", "certh", "nurk", "siv", "tor", "vek", "nar", "ur", "varn"],
      libraryLabel: "tabua recuperada",
      libraryNote: "A leitura finalmente entende que a Entidade nao corre, nao caca e nao precisa chamar. Ela apenas fecha o que ja estava tarde.",
      reward: "A morte nao corre. Ela confirma.",
      lockedToken: "[certeza lacrada]",
      pages: [
        {
          id: "certainty-1",
          folio: "folio I",
          title: "ela nao corre",
          excerpt: "Khar na corre.\nKhar keth.",
          annotation: "Nota de margem: o manuscrito resume a Entidade sem ornamento. Ela nao precisa pressa. Ela so fecha o que ja foi decidido.",
          studyTriggers: [
            "Khar na corre.",
            "A morte nao corre.",
            "Khar keth.",
            "A morte so confirma."
          ]
        },
        {
          id: "certainty-2",
          folio: "folio II",
          title: "certeza antes da voz",
          excerpt: "Siv veth va esh, sile.\nTor aer va esh, vara.",
          annotation: "Nota de margem: primeiro vem o chamado, depois o retorno. O texto manda calar antes de esperar, como se a certeza precisasse de eco.",
          studyTriggers: [
            "Siv veth va esh, sile.",
            "No primeiro chamado do nome, cale.",
            "Tor aer va esh, vara.",
            "Ao segundo retorno do nome, espere."
          ]
        }
      ]
    },
    {
      id: "absent-wind",
      title: "Tabua do Vento Ausente",
      sealedTitle: "folha sem vento IX",
      hint: "Conectivos, corpo, lugar, abertura e silencio absoluto.",
      sealedHint: "A folha nao se move. O ar falta entre as letras.",
      unlockHashes: [
        "33bfcbcb39fced5428393f7cd57cba7445295789c1bc26b9e70431fa5f2beaf3",
        "65156dccb391e2d11582b94c48286853afa18f8d7c41fe0fc56885959e959664",
        "5ed0a71bc7d42432812daee83ca79c245e270b3ae5325bb54cdf0325137e8282"
      ],
      words: [
        "ek", "ao", "kam", "dei", "dran", "mak", "ka", "vak", "torak", "orah",
        "akh", "arakh", "ul", "vorn", "vash", "vashar", "aern", "nora", "sael", "thir",
        "garn", "zorak", "skar", "karn", "farn", "raak", "vand", "vrok", "drok", "vadr",
        "trak", "kesh", "varnar", "zavar", "mornar", "lom", "gor", "nethar", "nethal", "kharun"
      ],
      libraryLabel: "tabua recuperada",
      libraryNote: "O idioma ganha palavras de passagem, corpo e ausencia. A leitura deixa de depender so de pedra, brasa e morte.",
      reward: "Frio sem vento. O silencio absoluto veio.",
      response: {
        unlock: "o fragmento respondeu sem vento. O frio aprendeu a entrar entre as palavras. Primeira folha: {folio}.",
        artifact: "o ar ficou parado na lombada."
      },
      lockedToken: "[vento ausente]",
      pages: [
        {
          id: "absent-wind-1",
          folio: "folio I",
          title: "frio sem vento",
          excerpt: "Hela dei vorn.\nNethar aer.",
          annotation: "Nota de margem: aqui a ausencia vira materia. O frio nao vem pelo vento; ele chega quando o vento falta.",
          studyTriggers: [
            "Hela dei vorn.",
            "Frio sem vento.",
            "Nethar aer.",
            "O silencio absoluto vem."
          ]
        },
        {
          id: "absent-wind-2",
          folio: "folio II",
          title: "junto e sob",
          excerpt: "Reth ek drath thur.\nVeyr ul drath.",
          annotation: "Nota de margem: a lingua aprende a juntar materia e a enterrar vinculo. O que fica nem sempre fica acima.",
          studyTriggers: [
            "Reth ek drath thur.",
            "A brasa e a pedra permanecem.",
            "Veyr ul drath.",
            "A raiz sob a pedra."
          ]
        },
        {
          id: "absent-wind-3",
          folio: "folio III",
          title: "mao sobre registro",
          excerpt: "Garn zavar varn.\nVarnar thur.",
          annotation: "Nota de margem: estudar nao e ler limpo. E por a mao no registro e aceitar que a escrita tambem permanece.",
          studyTriggers: [
            "Garn zavar varn.",
            "A mao estuda o registro.",
            "Varnar thur.",
            "A escrita permanece."
          ]
        },
        {
          id: "absent-wind-4",
          folio: "folio IV",
          title: "dentro e fora",
          excerpt: "Akh drok.\nArakh na vrok.",
          annotation: "Nota de margem: o dentro fecha e o fora nao abre. O texto trata passagem como estado, nao como lugar.",
          studyTriggers: [
            "Akh drok.",
            "Dentro fecha.",
            "Arakh na vrok.",
            "Fora nao abre."
          ]
        },
        {
          id: "absent-wind-5",
          folio: "folio V",
          title: "morte antiga",
          excerpt: "Kharun vara.\nNa raak. Na veth. Keth.",
          annotation: "Nota de margem: esta forma de morte nao age como bicho nem golpe. Ela espera, nao corre, nao chama, confirma.",
          studyTriggers: [
            "Kharun vara.",
            "A Morte antiga espera.",
            "Na raak. Na veth. Keth.",
            "Nao corre. Nao chama. Confirma."
          ]
        }
      ]
    },
    {
      id: "dry-words",
      title: "Tabua das Palavras Secas",
      sealedTitle: "indice seco X",
      hint: "Tempo, quantidade, afirmacao e contraste.",
      sealedHint: "Pequenas palavras raspadas. Elas ligam frases, mas nao explicam nada sozinhas.",
      unlockHashes: [
        "47213624e5cc780a1b31aee8ff2da8dd17b1d3d17d3e6ffa253b67854f24d5da",
        "52990342fd1683fb273ae78b8d94f1574dc5b165d977f032b3cbf65e3d8abdf8"
      ],
      words: ["toren", "athar", "thak", "nusa", "ulm", "oth", "thes", "drom", "nek", "ath", "dar", "ren", "sivath"],
      libraryLabel: "tabua recuperada",
      libraryNote: "A lingua recupera palavras pequenas: agora, ja, novamente, inteiro, outro, pouco e muito. Sao cortes de tempo, nao conversa comum.",
      reward: "Agora. Ja. De novo. A frase seca voltou.",
      response: {
        unlock: "a tabua seca respondeu. Palavras pequenas voltaram como pregos: agora, ja, novamente. Primeira folha: {folio}.",
        artifact: "a margem contou tempo sem calendario."
      },
      lockedToken: "[palavra seca]",
      pages: [
        {
          id: "dry-words-1",
          folio: "folio I",
          title: "agora e retorno",
          excerpt: "Ath dar.\nRen toren.",
          annotation: "Nota de margem: tempo, aqui, nao e calendario. E algo que ja aconteceu e volta a pesar.",
          studyTriggers: [
            "Ath dar.",
            "Agora ja.",
            "Ren toren.",
            "Novamente, entao."
          ]
        },
        {
          id: "dry-words-2",
          folio: "folio II",
          title: "inteiro e outro",
          excerpt: "Ulm thes.\nOth nek.",
          annotation: "Nota de margem: o inteiro e o mesmo aparecem como peso firme. O outro surge pequeno, quase fora da margem.",
          studyTriggers: [
            "Ulm thes.",
            "Inteiro e mesmo.",
            "Oth nek.",
            "Outro pouco."
          ]
        }
      ]
    },
    {
      id: "path-seal",
      title: "Tabua da Porta Selada",
      sealedTitle: "porta sem chave XI",
      hint: "Rastro, porta, mapa, selo, chave e marca.",
      sealedHint: "Ha abertura na folha, mas nenhum corte cedeu ainda.",
      unlockHashes: [
        "a716aeca98aa8984deb983fc86975967a064d0aeffd3a521cf88ade3b0a5ed81",
        "4d44f791dc936cc76a8c71f92b5a5947834f14227472accebeb26acdbe3c41b9"
      ],
      words: ["rhast", "gorn", "sharn", "rhastvarn", "vekr", "drokth", "korak"],
      libraryLabel: "tabua recuperada",
      libraryNote: "O volume aprende a falar de caminho e lacre. Nem toda abertura e passagem; nem toda marca e resposta.",
      reward: "O lacre nao abriu. A chave passou a existir.",
      response: {
        unlock: "a porta nao abriu. Ela apenas reconheceu que uma chave existe. Primeira folha: {folio}.",
        artifact: "o lacre rangeu por dentro."
      },
      lockedToken: "[porta lacrada]",
      pages: [
        {
          id: "path-seal-1",
          folio: "folio I",
          title: "lacre e chave",
          excerpt: "Drokth na vrok dei vekr.",
          annotation: "Nota de margem: a ausencia da chave e parte do lacre. A frase nao pede forca, pede correspondencia.",
          studyTriggers: [
            "Drokth na vrok dei vekr.",
            "O lacre nao abre sem chave."
          ]
        },
        {
          id: "path-seal-2",
          folio: "folio II",
          title: "rastro marcado",
          excerpt: "Rhast en rhastvarn.\nKorak thur.",
          annotation: "Nota de margem: caminho e mapa sao formas diferentes de rastro. A marca fica quando o passo ja passou.",
          studyTriggers: [
            "Rhast en rhastvarn.",
            "O caminho no mapa.",
            "Korak thur.",
            "A marca permanece."
          ]
        }
      ]
    },
    {
      id: "cold-matter",
      title: "Tabua da Materia Fria",
      sealedTitle: "cinza fria XII",
      hint: "Terra, madeira, folha, ferrugem, cinza, luz fraca e frio endurecido.",
      sealedHint: "A materia esta presente, mas a mao ainda nao sabe nomear seus restos.",
      unlockHashes: [
        "67d76e6ab6472d67fa50a163844955f1190414a2e111c0ba0690725c66246d8b",
        "c64165c5c9a9eb7deed8f20e36cf07a87fee38b3df2bd63bcdfe82a198b79226"
      ],
      words: ["saelar", "durn", "tharn", "lath", "grom", "dal", "lum", "helk", "helna", "saaren", "sakh", "vashn"],
      libraryLabel: "tabua recuperada",
      libraryNote: "A lingua ganha materia de cenario: terra, madeira, ferrugem, cinza, gelo, neve, calor e um brilho quase morto.",
      reward: "A cinza fria voltou a ter nome.",
      response: {
        unlock: "a materia fria respondeu. Cinza, ferrugem e luz fraca ganharam peso. Primeira folha: {folio}.",
        artifact: "po frio apareceu na borda."
      },
      lockedToken: "[materia fria]",
      pages: [
        {
          id: "cold-matter-1",
          folio: "folio I",
          title: "cinza e ferrugem",
          excerpt: "Dal en grom.\nLum thur.",
          annotation: "Nota de margem: ferrugem e cinza fria sao restos diferentes. A luz fraca permanece como quase nada.",
          studyTriggers: [
            "Dal en grom.",
            "Cinza fria na ferrugem.",
            "Lum thur.",
            "A luz fraca permanece."
          ]
        },
        {
          id: "cold-matter-2",
          folio: "folio II",
          title: "gelo, neve e terra",
          excerpt: "Helk en durn.\nHelna va aern.",
          annotation: "Nota de margem: o frio endurece e depois cai. O ceu deixa resto sobre a terra.",
          studyTriggers: [
            "Helk en durn.",
            "Gelo na terra.",
            "Helna va aern.",
            "Neve do ceu."
          ]
        }
      ]
    },
    {
      id: "broken-body",
      title: "Tabua do Corpo Quebrado",
      sealedTitle: "corpo em tremor XIII",
      hint: "Cabeca, garganta, ouvido, membros, coracao, folego curto e movimento.",
      sealedHint: "O corpo aparece em partes. A margem ainda nao sabe juntar os ossos.",
      unlockHashes: [
        "e34a386b771792378d43f4b181b477d6d00ebade51a6b396dbeba6be5d8a4ae0",
        "fc7f78678de9ecd5a5630a5a50745ee9299be25c13f0e06d54eb41796bede5b2"
      ],
      words: ["thok", "gorl", "selak", "garnath", "drek", "kora", "halm", "sek", "mir", "dorn", "morak", "zorva", "garnen", "tharnak", "sov", "darun", "larun"],
      libraryLabel: "tabua recuperada",
      libraryNote: "O Haater passa a falar do corpo em partes e sinais: tremor, arrepio, folego curto, garganta, ouvido, perna e coracao.",
      reward: "O corpo voltou quebrado, mas voltou.",
      response: {
        unlock: "o corpo respondeu em partes. Primeiro veio o folego curto; depois, a pele soube. Primeira folha: {folio}.",
        artifact: "a mesa pareceu tremer uma vez."
      },
      lockedToken: "[corpo partido]",
      pages: [
        {
          id: "broken-body-1",
          folio: "folio I",
          title: "folego e arrepio",
          excerpt: "Halm sek.\nMir en skar.",
          annotation: "Nota de margem: o corpo sabe antes da voz. Folego curto, tremor e pele fria aparecem como aviso.",
          studyTriggers: [
            "Halm sek.",
            "O folego curto treme.",
            "Mir en skar.",
            "Arrepio na pele."
          ]
        },
        {
          id: "broken-body-2",
          folio: "folio II",
          title: "garganta e ouvido",
          excerpt: "Gorl na veth.\nSelak seln.",
          annotation: "Nota de margem: a garganta recusa chamar. O ouvido escuta antes da boca responder.",
          studyTriggers: [
            "Gorl na veth.",
            "A garganta nao chama.",
            "Selak seln.",
            "O ouvido escuta."
          ]
        }
      ]
    },
    {
      id: "inner-weight",
      title: "Tabua do Peso Interior",
      sealedTitle: "luto sem voz XIV",
      hint: "Medo, raiva, luto, verdade, mentira, culpa, pacto, destino e erro.",
      sealedHint: "A folha pesa sem materia. O interior ainda nao recebeu nome.",
      unlockHashes: [
        "7901d99d365232366b892fa5446ac873793d4b6e46b987fe2fbc8e2a9b4d1d51",
        "1798cfb1998addf75c1ca7b666eccf583726dc7b34542e33fb40aef57a619d4b"
      ],
      words: ["tevr", "krav", "valm", "rethar", "vayn", "glor", "treth", "vrel", "thurv", "veyrn", "kaern", "kharal", "savana", "savar", "orakh", "drun", "cer", "vrak", "vahrak", "cerun"],
      libraryLabel: "tabua recuperada",
      libraryNote: "A lingua ganha abstracoes secas. Mesmo medo, luto e destino entram como peso, marca ou brasa, nunca como confissao bonita.",
      reward: "A verdade ficou. A mentira caiu.",
      response: {
        unlock: "o peso interior respondeu sem voz. A verdade ficou; a mentira perdeu o proprio chao. Primeira folha: {folio}.",
        artifact: "o nome pesou antes da traducao."
      },
      lockedToken: "[peso interior]",
      pages: [
        {
          id: "inner-weight-1",
          folio: "folio I",
          title: "verdade e mentira",
          excerpt: "Treth thur.\nVrel khar.",
          annotation: "Nota de margem: verdade permanece como pedra. Mentira cai como eco falso sem peso.",
          studyTriggers: [
            "Treth thur.",
            "A verdade permanece.",
            "Vrel khar.",
            "A mentira cai."
          ]
        },
        {
          id: "inner-weight-2",
          folio: "folio II",
          title: "medo, culpa e pressagio",
          excerpt: "Tevr en kaern.\nOrakh dar.",
          annotation: "Nota de margem: medo e culpa se alojam juntos. O pressagio chega antes do esperado.",
          studyTriggers: [
            "Tevr en kaern.",
            "Medo na culpa.",
            "Orakh dar.",
            "O pressagio ja veio."
          ]
        }
      ]
    },
    {
      id: "staying-people",
      title: "Tabua do Povo Que Ficou",
      sealedTitle: "nomes coletivos XV",
      hint: "Voce, ele, povo, crianca, anciao, aliado, inimigo, leitor, escriba e mestre.",
      sealedHint: "Ha presencas na borda, mas nenhuma responde inteira ainda.",
      unlockHashes: [
        "c1c7126844265ecc2d879b43e8244f54e65e4b6cb6484a8f6e08ca26af8a40ae",
        "1f51b02f1cf3e07d94b99811607c089895c67cca7df065cd2b160cde4ee01ce7"
      ],
      words: ["tha", "sha", "shen", "han", "naren", "ithen", "uren", "thurak", "khor", "kharen", "vadrak", "zavren", "varnak", "othar", "drathak"],
      libraryLabel: "tabua recuperada",
      libraryNote: "O idioma passa a nomear pessoas sem perder dureza: povo, estranho, morto, guardiao, leitor e mestre.",
      reward: "O povo ficou. Alguem ainda le.",
      response: {
        unlock: "o povo que ficou respondeu. Ninguem chamou alto; mesmo assim, alguem ainda le. Primeira folha: {folio}.",
        artifact: "houve passos onde nao havia sala."
      },
      lockedToken: "[povo ausente]",
      pages: [
        {
          id: "staying-people-1",
          folio: "folio I",
          title: "povo e anciao",
          excerpt: "Naren thur.\nUren sava. Ithen zor.",
          annotation: "Nota de margem: o povo permanece pelo anciao que lembra e pela crianca que ainda ve.",
          studyTriggers: [
            "Naren thur.",
            "O povo permanece.",
            "Uren sava. Ithen zor.",
            "O anciao lembra. A crianca ve."
          ]
        },
        {
          id: "staying-people-2",
          folio: "folio II",
          title: "leitor e escriba",
          excerpt: "Zavren zor.\nVarnak varnar.",
          annotation: "Nota de margem: ha quem veja o rastro e ha quem prenda o rastro em registro. Ambos carregam perigo.",
          studyTriggers: [
            "Zavren zor.",
            "O leitor ve.",
            "Varnak varnar.",
            "O escriba escreve."
          ]
        }
      ]
    },
    {
      id: "cold-colors",
      title: "Tabua das Cores Frias",
      sealedTitle: "pigmento apagado XVI",
      hint: "Branco, preto, vermelho, azul escuro, dourado, cinza e verde.",
      sealedHint: "A cor existe, mas o tomo ainda so reconhece sombra e roxo.",
      unlockHashes: [
        "c7089837fd76a169e06bb0fffe9f6035b6b22ddcb1c61b863b77d1cb95bc236f",
        "d183f34d2cabcb6b3c452eb2b5521f4ae98c76ca24efb1fa9d8b1d36c4e237ff"
      ],
      words: ["vael", "mornak", "kaelar", "nethvior", "saelth", "daln", "veyral"],
      libraryLabel: "tabua recuperada",
      libraryNote: "As cores entram como materia: branco frio, preto fechado, vermelho de sangue, azul de roxo frio, dourado de metal e verde de raiz.",
      reward: "A cor voltou sem parecer viva.",
      response: {
        unlock: "as cores frias responderam. Nenhuma delas pareceu viva; todas ficaram. Primeira folha: {folio}.",
        artifact: "a tinta escureceu sem molhar."
      },
      lockedToken: "[cor apagada]",
      pages: [
        {
          id: "cold-colors-1",
          folio: "folio I",
          title: "branco e preto",
          excerpt: "Vael lum.\nMornak thur.",
          annotation: "Nota de margem: o branco e luz fria. O preto e sombra fechada que permanece.",
          studyTriggers: [
            "Vael lum.",
            "Branco de luz fraca.",
            "Mornak thur.",
            "O preto permanece."
          ]
        },
        {
          id: "cold-colors-2",
          folio: "folio II",
          title: "sangue e raiz",
          excerpt: "Kaelar en daln.\nVeyral ul drath.",
          annotation: "Nota de margem: vermelho e cinza se misturam como resto. Verde nao e vida aberta; e raiz sob pedra.",
          studyTriggers: [
            "Kaelar en daln.",
            "Vermelho no cinza.",
            "Veyral ul drath.",
            "Verde sob a pedra."
          ]
        }
      ]
    }
  ].map(function (fragment, index) {
    return Object.assign({}, fragment, {
      order: index + 1,
      pages: (fragment.pages || []).map(function (page, pageIndex) {
        return Object.assign({}, page, {
          order: pageIndex + 1
        });
      })
    });
  });

  const LEXICON = [
    { id: "sa", haater: "sa", pt: "alguem", gloss: "algum / alguem / uma presenca indefinida", reverse: ["alguem", "algum", "alguns", "uma", "quem"], fragment: "base" },
    { id: "saar", haater: "saar", pt: "chama", gloss: "chama / fogo / luz que resiste", reverse: ["chama", "fogo", "luz"], fragment: "base" },
    { id: "reth", haater: "reth", pt: "brasa", gloss: "brasa / resto aceso / o que continua ardendo", reverse: ["brasa", "brasas", "cinza", "resto"], fragment: "stone" },
    { id: "rethen", haater: "rethen", pt: "brasas", gloss: "brasas / brasas que sobraram / o resto que nao caiu", reverse: ["brasas", "brasas que sobraram"], fragment: "book1" },
    { id: "drath", haater: "drath", pt: "pedra", gloss: "pedra / base / chao", reverse: ["pedra", "base", "chao", "chão"], fragment: "base" },
    { id: "kael", haater: "kael", pt: "sangue", gloss: "sangue", reverse: ["sangue"], fragment: "base" },
    { id: "thal", haater: "thal", pt: "metal", gloss: "metal / armadura", reverse: ["metal", "armadura"], fragment: "base" },
    { id: "morn", haater: "morn", pt: "sombra", gloss: "sombra / escuro", reverse: ["sombra", "escuro", "escuridao", "escuridão"], fragment: "base" },
    { id: "vior", haater: "vior", pt: "roxo", gloss: "roxo / purpura", reverse: ["roxo", "roxa", "purpura", "púrpura"], fragment: "base" },
    { id: "esh", haater: "esh", pt: "nome", gloss: "nome / essencia / aquilo que responde quando e chamado", reverse: ["nome", "nomes", "essencia", "essência", "identidade"], fragment: "name" },
    { id: "ruun", haater: "ruun", pt: "ruina", gloss: "ruina / fim / destruicao", reverse: ["ruina", "ruína", "fim"], fragment: "stone" },
    { id: "vel", haater: "vel", pt: "folego", gloss: "vida / folego / ar vivo", reverse: ["folego", "fôlego", "vida", "ar"], fragment: "base" },
    { id: "khar", haater: "khar", pt: "morte", gloss: "cair / morrer / morte / fim consumado", reverse: ["morte", "morrer", "queda", "fim"], fragment: "base" },
    { id: "thur", haater: "thur", pt: "permanece", gloss: "permanecer / suportar / ainda estar", reverse: ["permanece", "permanecer", "suporta", "suportar", "resiste"], fragment: "stone" },
    { id: "sava", haater: "sava", pt: "lembra", gloss: "lembrar / guardar memoria", reverse: ["lembra", "lembrar", "memoria", "memória"], fragment: "root" },
    { id: "veyr", haater: "veyr", pt: "raiz", gloss: "raiz / vinculo preso no fundo", reverse: ["raiz", "vinculo", "vínculo", "fundo"], fragment: "root" },
    { id: "vahr", haater: "vahr", pt: "vontade", gloss: "vontade / impulso", reverse: ["vontade", "impulso"], fragment: "root" },
    { id: "drael", haater: "drael", pt: "sonho", gloss: "sonho", reverse: ["sonho", "sonhos"], fragment: "root" },
    { id: "orun", haater: "orun", pt: "solitario", gloss: "so / solitario", reverse: ["so", "só", "solitario", "solitário"], fragment: "root" },
    { id: "varn", haater: "varn", pt: "registro", gloss: "caderno / registro / texto escrito", reverse: ["registro", "caderno", "texto", "escrito"], fragment: "certainty" },
    { id: "ik", haater: "ik", pt: "eu", gloss: "eu", reverse: ["eu"], fragment: "base" },
    { id: "ith", haater: "ith", pt: "pequeno", gloss: "pequeno / jovem / ainda no inicio", reverse: ["pequeno", "pequena", "jovem"], fragment: "book1" },
    { id: "tir", haater: "tir", pt: "noite", gloss: "noite / escuro longo", reverse: ["noite"], fragment: "book1" },
    { id: "nar", haater: "nar", pt: "nos", gloss: "nos / nosso", reverse: ["nos", "nós", "nosso", "nossa"], fragment: "certainty" },
    { id: "na", haater: "na", pt: "nao", gloss: "nao", reverse: ["nao", "não"], fragment: "base" },
    { id: "ur", haater: "ur", pt: "antigo", gloss: "antigo / outrora / passado", reverse: ["antigo", "outrora", "passado"], fragment: "certainty" },
    { id: "en", haater: "en", pt: "em", gloss: "em / entre", reverse: ["em", "entre", "no", "na"], fragment: "stone" },
    { id: "va", haater: "va", pt: "de", gloss: "de / do / da", reverse: ["de", "do", "da"], fragment: "stone" },
    { id: "aer", haater: "aer", pt: "vem", gloss: "vir / chegar / retornar", reverse: ["vir", "vem", "chegar", "retorno", "retornar", "voltar", "veio"], fragment: "interval" },
    { id: "dren", haater: "dren", pt: "puxa", gloss: "puxar / arrancar / levar", reverse: ["puxa", "puxar", "arrancar", "levar"], fragment: "root" },
    { id: "zor", haater: "zor", pt: "ve", gloss: "ver / notar / encontrar / reparar", reverse: ["ver", "ve", "vê", "notar", "encontrar", "reparar", "repare"], fragment: "base" },
    { id: "zora", haater: "zora", pt: "encontra", gloss: "ver / encontrar / localizar um rastro", reverse: ["encontra", "encontrar", "encontrara", "acha", "achar", "localiza"], fragment: "book1" },
    { id: "veth", haater: "veth", pt: "chama", gloss: "chamar / dar voz / convocar", reverse: ["chama", "chamar", "convocar", "chamado"], fragment: "name" },
    { id: "vara", haater: "vara", pt: "espera", gloss: "esperar imovel / vigiar sem mover", reverse: ["espera", "esperar", "aguarde", "aguardar", "vigiar"], fragment: "interval" },
    { id: "sorn", haater: "sorn", pt: "som", gloss: "som / voz / eco curto", reverse: ["som", "voz", "eco"], fragment: "name" },
    { id: "tavar", haater: "tavar", pt: "atrasa", gloss: "tardar / voltar fora do tempo", reverse: ["atrasa", "atrasar", "atraso", "tarde"], fragment: "name" },
    { id: "shel", haater: "shel", pt: "vazio", gloss: "vazio / oco / espaco que sobra", reverse: ["vazio", "oco"], fragment: "body" },
    { id: "neth", haater: "neth", pt: "silencio", gloss: "silencio pesado / abafamento", reverse: ["silencio", "silêncio"], fragment: "name" },
    { id: "hela", haater: "hela", pt: "frio", gloss: "frio seco / frio sem vento", reverse: ["frio"], fragment: "interval" },
    { id: "raan", haater: "raan", pt: "rosto", gloss: "rosto / face / forma visivel", reverse: ["rosto", "rostos", "face"], fragment: "body" },
    { id: "drae", haater: "drae", pt: "pesado", gloss: "pesado / peso antigo / grande por opressao", reverse: ["pesado", "pesava", "grande", "peso"], fragment: "book1" },
    { id: "siv", haater: "siv", pt: "primeiro", gloss: "primeiro / comeco", reverse: ["primeiro", "comeco", "começo"], fragment: "certainty" },
    { id: "tor", haater: "tor", pt: "depois", gloss: "depois / segundo retorno / em seguida", reverse: ["depois", "segundo"], fragment: "certainty" },
    { id: "sile", haater: "sile", pt: "cale", gloss: "calar / ficar em silencio", reverse: ["cale", "calar"], fragment: "name" },
    { id: "gath", haater: "gath", pt: "golpe", gloss: "golpe / impacto / corte", reverse: ["golpe", "impacto", "corte", "ferimento"], fragment: "interval" },
    { id: "talm", haater: "talm", pt: "dor", gloss: "dor / ferida que arde", reverse: ["dor", "ferida"], fragment: "interval" },
    { id: "seln", haater: "seln", pt: "escuta", gloss: "ouvir / escutar", reverse: ["escutar", "ouvir", "escute", "ouve"], fragment: "body" },
    { id: "fara", haater: "fara", pt: "forma", gloss: "forma / aparencia", reverse: ["forma", "aparencia", "aparência"], fragment: "body" },
    { id: "kor", haater: "kor", pt: "aviso", gloss: "aviso / sinal", reverse: ["aviso", "sinal"], fragment: "body" },
    { id: "oren", haater: "oren", pt: "onde", gloss: "onde / no ponto em que", reverse: ["onde"], fragment: "body" },
    { id: "reku", haater: "reku", pt: "recue", gloss: "recuar / afastar", reverse: ["recuar", "recue", "afastar", "afaste"], fragment: "body" },
    { id: "nurk", haater: "nurk", pt: "nunca", gloss: "nunca", reverse: ["nunca"], fragment: "certainty" },
    { id: "sen", haater: "sen", pt: "responda", gloss: "responder / devolver voz", reverse: ["responda", "responder", "devolver"], fragment: "name" },
    { id: "anar", haater: "anar", pt: "sabe", gloss: "saber pelo corpo / entender antes da razao", reverse: ["sabe", "entende", "sente", "sentir"], fragment: "body" },
    { id: "boka", haater: "boka", pt: "boca", gloss: "boca / voz fisica", reverse: ["boca"], fragment: "body" },
    { id: "lar", haater: "lar", pt: "deixe", gloss: "deixar / soltar", reverse: ["deixe", "deixar", "soltar"], fragment: "body" },
    { id: "preth", haater: "preth", pt: "antes", gloss: "antes / previamente", reverse: ["antes"], fragment: "interval" },
    { id: "certh", haater: "certh", pt: "certeza", gloss: "certeza / fixidez inevitavel", reverse: ["certeza"], fragment: "certainty" },
    { id: "ora", haater: "ora", pt: "perto", gloss: "perto / proximo", reverse: ["perto", "proximo", "próximo"], fragment: "interval" },
    { id: "keth", haater: "keth", pt: "confirma", gloss: "confirmar / fechar / tornar certo", reverse: ["confirma", "confirmar"], fragment: "certainty" },
    { id: "vek", haater: "vek", pt: "se", gloss: "se / quando", reverse: ["se", "quando"], fragment: "certainty" },
    { id: "marth", haater: "marth", pt: "peso", gloss: "peso / gravidade / pressao", reverse: ["peso", "gravidade", "pressao", "pressão"], fragment: "stone" },
    { id: "ek", haater: "ek", pt: "e", gloss: "e / tambem / junto", reverse: ["e", "tambem", "junto"], fragment: "absent-wind" },
    { id: "ao", haater: "ao", pt: "para", gloss: "para / em direcao a / contra", reverse: ["para", "direcao", "contra"], fragment: "absent-wind" },
    { id: "kam", haater: "kam", pt: "com", gloss: "com / junto de / carregando junto", reverse: ["com", "junto"], fragment: "absent-wind" },
    { id: "dei", haater: "dei", pt: "sem", gloss: "sem / ausente de / vazio de", reverse: ["sem", "ausente", "falta"], fragment: "absent-wind" },
    { id: "dran", haater: "dran", pt: "por", gloss: "por / atraves / pela causa de", reverse: ["por", "atraves", "causa"], fragment: "absent-wind" },
    { id: "mak", haater: "mak", pt: "mas", gloss: "mas / porem / corte de sentido", reverse: ["mas", "porem"], fragment: "absent-wind" },
    { id: "ka", haater: "ka", pt: "pergunta", gloss: "pergunta / duvida ritual", reverse: ["pergunta", "duvida", "interrogacao"], fragment: "absent-wind" },
    { id: "vak", haater: "vak", pt: "aqui", gloss: "aqui / neste ponto / neste lugar", reverse: ["aqui", "neste", "lugar"], fragment: "absent-wind" },
    { id: "torak", haater: "torak", pt: "la", gloss: "la / ali / lugar distante", reverse: ["la", "ali", "distante"], fragment: "absent-wind" },
    { id: "orah", haater: "orah", pt: "longe", gloss: "longe / fora do alcance", reverse: ["longe", "distante"], fragment: "absent-wind" },
    { id: "akh", haater: "akh", pt: "dentro", gloss: "dentro / no interior", reverse: ["dentro", "interior"], fragment: "absent-wind" },
    { id: "arakh", haater: "arakh", pt: "fora", gloss: "fora / expulso do interior", reverse: ["fora", "exterior"], fragment: "absent-wind" },
    { id: "ul", haater: "ul", pt: "sob", gloss: "sob / abaixo / enterrado", reverse: ["sob", "abaixo", "debaixo", "enterrado"], fragment: "absent-wind" },
    { id: "vorn", haater: "vorn", pt: "vento", gloss: "vento / ar em movimento", reverse: ["vento", "ar em movimento"], fragment: "absent-wind" },
    { id: "vash", haater: "vash", pt: "agua", gloss: "agua / liquido frio", reverse: ["agua", "liquido"], fragment: "absent-wind" },
    { id: "vashar", haater: "vashar", pt: "chuva", gloss: "chuva / agua que cai", reverse: ["chuva"], fragment: "absent-wind" },
    { id: "aern", haater: "aern", pt: "ceu", gloss: "ceu / alto aberto", reverse: ["ceu", "alto"], fragment: "absent-wind" },
    { id: "nora", haater: "nora", pt: "lua", gloss: "lua / luz fria da noite", reverse: ["lua"], fragment: "absent-wind" },
    { id: "sael", haater: "sael", pt: "sol", gloss: "sol / fogo alto / luz do dia", reverse: ["sol", "dia"], fragment: "absent-wind" },
    { id: "thir", haater: "thir", pt: "estrela", gloss: "estrela / ponto de luz distante", reverse: ["estrela", "estrelas"], fragment: "absent-wind" },
    { id: "garn", haater: "garn", pt: "mao", gloss: "mao / toque / posse fisica", reverse: ["mao", "maos", "toque"], fragment: "absent-wind" },
    { id: "zorak", haater: "zorak", pt: "olho", gloss: "olho / lugar de ver", reverse: ["olho", "olhos"], fragment: "absent-wind" },
    { id: "skar", haater: "skar", pt: "pele", gloss: "pele / limite do corpo", reverse: ["pele"], fragment: "absent-wind" },
    { id: "karn", haater: "karn", pt: "osso", gloss: "osso / estrutura restante", reverse: ["osso", "ossos"], fragment: "absent-wind" },
    { id: "farn", haater: "farn", pt: "corpo", gloss: "corpo / forma viva inteira", reverse: ["corpo"], fragment: "absent-wind" },
    { id: "raak", haater: "raak", pt: "corre", gloss: "correr / fugir por impulso", reverse: ["correr", "corre", "fugir", "foge"], fragment: "absent-wind" },
    { id: "vand", haater: "vand", pt: "anda", gloss: "andar / passar em passos", reverse: ["andar", "anda", "passo", "passos"], fragment: "absent-wind" },
    { id: "vrok", haater: "vrok", pt: "abre", gloss: "abrir / ceder / destravar", reverse: ["abrir", "abre", "ceder", "destravar"], fragment: "absent-wind" },
    { id: "drok", haater: "drok", pt: "fecha", gloss: "fechar / selar / calar entrada", reverse: ["fechar", "fecha", "selar", "selado"], fragment: "absent-wind" },
    { id: "vadr", haater: "vadr", pt: "guarda", gloss: "guardar / segurar / manter consigo", reverse: ["guardar", "guarda", "segurar"], fragment: "absent-wind" },
    { id: "trak", haater: "trak", pt: "quebra", gloss: "quebrar / partir", reverse: ["quebrar", "quebra", "partir"], fragment: "absent-wind" },
    { id: "kesh", haater: "kesh", pt: "corta", gloss: "cortar / separar por fio", reverse: ["cortar", "corta", "separar"], fragment: "absent-wind" },
    { id: "varnar", haater: "varnar", pt: "escreve", gloss: "escrever / prender em registro", reverse: ["escrever", "escreve"], fragment: "absent-wind" },
    { id: "zavar", haater: "zavar", pt: "le", gloss: "ler / estudar marcas / estudar rastro", reverse: ["ler", "le", "estudar", "estuda"], fragment: "absent-wind" },
    { id: "mornar", haater: "mornar", pt: "esconde", gloss: "esconder / guardar na sombra", reverse: ["esconder", "esconde"], fragment: "absent-wind" },
    { id: "lom", haater: "lom", pt: "leve", gloss: "leve / sem peso / leve demais", reverse: ["leve"], fragment: "absent-wind" },
    { id: "gor", haater: "gor", pt: "grave", gloss: "grave / baixo / pesado de som", reverse: ["grave", "baixo"], fragment: "absent-wind" },
    { id: "nethar", haater: "nethar", pt: "silencio absoluto", gloss: "silencio absoluto / ausencia total de som", reverse: ["silencio absoluto", "silencio total"], fragment: "absent-wind" },
    { id: "nethal", haater: "nethal", pt: "segredo", gloss: "segredo / coisa guardada no silencio", reverse: ["segredo"], fragment: "absent-wind" },
    { id: "kharun", haater: "kharun", pt: "morte antiga", gloss: "Morte antiga / a Morte como forca, nao evento", reverse: ["morte antiga", "entidade da morte"], fragment: "absent-wind" },
    { id: "toren", haater: "toren", pt: "entao", gloss: "entao / depois disso / assim veio", reverse: ["entao", "assim"], fragment: "dry-words" },
    { id: "athar", haater: "athar", pt: "acima", gloss: "acima / sobre a superficie", reverse: ["acima", "sobre"], fragment: "dry-words" },
    { id: "thak", haater: "thak", pt: "sim", gloss: "sim / afirmacao seca / esta feito", reverse: ["sim", "afirmacao"], fragment: "dry-words" },
    { id: "nusa", haater: "nusa", pt: "nenhum", gloss: "nenhum / ausencia de alguem", reverse: ["nenhum", "ninguem"], fragment: "dry-words" },
    { id: "ulm", haater: "ulm", pt: "todo", gloss: "todo / inteiro / sem corte", reverse: ["todo", "inteiro"], fragment: "dry-words" },
    { id: "oth", haater: "oth", pt: "outro", gloss: "outro / diferente / de fora", reverse: ["outro", "diferente"], fragment: "dry-words" },
    { id: "thes", haater: "thes", pt: "mesmo", gloss: "mesmo / igual em peso", reverse: ["mesmo", "igual"], fragment: "dry-words" },
    { id: "drom", haater: "drom", pt: "muito", gloss: "muito / excesso pesado", reverse: ["muito", "excesso"], fragment: "dry-words" },
    { id: "nek", haater: "nek", pt: "pouco", gloss: "pouco / resto pequeno", reverse: ["pouco"], fragment: "dry-words" },
    { id: "ath", haater: "ath", pt: "agora", gloss: "agora / neste ponto", reverse: ["agora"], fragment: "dry-words" },
    { id: "dar", haater: "dar", pt: "ja", gloss: "ja / antes do esperado", reverse: ["ja"], fragment: "dry-words" },
    { id: "ren", haater: "ren", pt: "novamente", gloss: "novamente / de novo / retorno repetido", reverse: ["novamente", "de novo"], fragment: "dry-words" },
    { id: "sivath", haater: "sivath", pt: "instante", gloss: "hora / instante / ponto de tempo", reverse: ["hora", "instante"], fragment: "dry-words" },
    { id: "rhast", haater: "rhast", pt: "caminho", gloss: "rastro seguido / caminho", reverse: ["caminho", "rastro"], fragment: "path-seal" },
    { id: "gorn", haater: "gorn", pt: "porta", gloss: "abertura selada / porta", reverse: ["porta"], fragment: "path-seal" },
    { id: "sharn", haater: "sharn", pt: "passagem", gloss: "passagem estreita / corredor", reverse: ["passagem", "corredor"], fragment: "path-seal" },
    { id: "rhastvarn", haater: "rhastvarn", pt: "mapa", gloss: "registro de rastro / mapa", reverse: ["mapa"], fragment: "path-seal" },
    { id: "vekr", haater: "vekr", pt: "chave", gloss: "aquilo que abre lacre", reverse: ["chave"], fragment: "path-seal" },
    { id: "drokth", haater: "drokth", pt: "lacre", gloss: "fechamento ritual / selo", reverse: ["selo", "lacre"], fragment: "path-seal" },
    { id: "korak", haater: "korak", pt: "marca", gloss: "marca / sinal deixado", reverse: ["marca", "sinal"], fragment: "path-seal" },
    { id: "saelar", haater: "saelar", pt: "dia", gloss: "tempo de luz / dia", reverse: ["dia"], fragment: "cold-matter" },
    { id: "durn", haater: "durn", pt: "terra", gloss: "terra baixa / solo", reverse: ["terra", "solo"], fragment: "cold-matter" },
    { id: "tharn", haater: "tharn", pt: "madeira", gloss: "madeira / materia seca", reverse: ["madeira"], fragment: "cold-matter" },
    { id: "lath", haater: "lath", pt: "folha", gloss: "folha / pagina / lamina fina", reverse: ["folha", "pagina"], fragment: "cold-matter" },
    { id: "grom", haater: "grom", pt: "ferrugem", gloss: "metal velho / ferrugem", reverse: ["ferrugem"], fragment: "cold-matter" },
    { id: "dal", haater: "dal", pt: "cinza fria", gloss: "resto apagado / cinza fria", reverse: ["cinza fria", "cinza"], fragment: "cold-matter" },
    { id: "lum", haater: "lum", pt: "luz fraca", gloss: "brilho distante / luz fraca", reverse: ["luz fraca", "brilho"], fragment: "cold-matter" },
    { id: "helk", haater: "helk", pt: "gelo", gloss: "frio endurecido / gelo", reverse: ["gelo"], fragment: "cold-matter" },
    { id: "helna", haater: "helna", pt: "neve", gloss: "frio caido / neve", reverse: ["neve"], fragment: "cold-matter" },
    { id: "saaren", haater: "saaren", pt: "calor", gloss: "calor de chama", reverse: ["calor", "quente"], fragment: "cold-matter" },
    { id: "sakh", haater: "sakh", pt: "seco", gloss: "seco / sem agua", reverse: ["seco"], fragment: "cold-matter" },
    { id: "vashn", haater: "vashn", pt: "molhado", gloss: "tocado por agua", reverse: ["molhado"], fragment: "cold-matter" },
    { id: "thok", haater: "thok", pt: "cabeca", gloss: "cabeca / cranio", reverse: ["cabeca", "cranio"], fragment: "broken-body" },
    { id: "gorl", haater: "gorl", pt: "garganta", gloss: "garganta / passagem da voz", reverse: ["garganta"], fragment: "broken-body" },
    { id: "selak", haater: "selak", pt: "ouvido", gloss: "ouvido / lugar da escuta", reverse: ["ouvido"], fragment: "broken-body" },
    { id: "garnath", haater: "garnath", pt: "braco", gloss: "extensao da mao / braco", reverse: ["braco"], fragment: "broken-body" },
    { id: "drek", haater: "drek", pt: "perna", gloss: "apoio que anda / perna", reverse: ["perna"], fragment: "broken-body" },
    { id: "kora", haater: "kora", pt: "coracao", gloss: "centro quente / coracao", reverse: ["coracao"], fragment: "broken-body" },
    { id: "halm", haater: "halm", pt: "folego curto", gloss: "ar quebrado / folego curto", reverse: ["folego curto"], fragment: "broken-body" },
    { id: "sek", haater: "sek", pt: "tremor", gloss: "tremor pequeno / sinal do corpo", reverse: ["tremor"], fragment: "broken-body" },
    { id: "mir", haater: "mir", pt: "arrepio", gloss: "frio interno / arrepio", reverse: ["arrepio"], fragment: "broken-body" },
    { id: "dorn", haater: "dorn", pt: "dorme", gloss: "dormir / brasa baixa", reverse: ["dormir", "dorme"], fragment: "broken-body" },
    { id: "morak", haater: "morak", pt: "engole", gloss: "engolir / comer / consumir", reverse: ["engolir", "comer", "engole"], fragment: "broken-body" },
    { id: "zorva", haater: "zorva", pt: "procura", gloss: "procurar / ver pelo rastro", reverse: ["procurar", "procura"], fragment: "broken-body" },
    { id: "garnen", haater: "garnen", pt: "toca", gloss: "tocar / por a mao", reverse: ["tocar", "toca"], fragment: "broken-body" },
    { id: "tharnak", haater: "tharnak", pt: "carrega", gloss: "carregar / suportar peso", reverse: ["carregar", "carrega"], fragment: "broken-body" },
    { id: "sov", haater: "sov", pt: "sobe", gloss: "subir / erguer", reverse: ["subir", "sobe", "erguer"], fragment: "broken-body" },
    { id: "darun", haater: "darun", pt: "desce", gloss: "descer / ir ao baixo", reverse: ["descer", "desce"], fragment: "broken-body" },
    { id: "larun", haater: "larun", pt: "deixa cair", gloss: "soltar para baixo / deixar cair", reverse: ["deixar cair", "soltar"], fragment: "broken-body" },
    { id: "tevr", haater: "tevr", pt: "medo", gloss: "medo frio / recuo interno", reverse: ["medo"], fragment: "inner-weight" },
    { id: "krav", haater: "krav", pt: "raiva", gloss: "raiva / calor agressivo", reverse: ["raiva"], fragment: "inner-weight" },
    { id: "valm", haater: "valm", pt: "luto", gloss: "tristeza / luto / peso de perda", reverse: ["tristeza", "luto"], fragment: "inner-weight" },
    { id: "rethar", haater: "rethar", pt: "esperanca", gloss: "brasa que ainda nao apagou", reverse: ["esperanca"], fragment: "inner-weight" },
    { id: "vayn", haater: "vayn", pt: "paz", gloss: "quietude sem guerra / paz", reverse: ["paz"], fragment: "inner-weight" },
    { id: "glor", haater: "glor", pt: "gloria", gloss: "brilho falso / gloria", reverse: ["gloria"], fragment: "inner-weight" },
    { id: "treth", haater: "treth", pt: "verdade", gloss: "coisa firme / verdade", reverse: ["verdade"], fragment: "inner-weight" },
    { id: "vrel", haater: "vrel", pt: "mentira", gloss: "eco falso / mentira", reverse: ["mentira"], fragment: "inner-weight" },
    { id: "thurv", haater: "thurv", pt: "juramento", gloss: "promessa que permanece", reverse: ["juramento", "promessa"], fragment: "inner-weight" },
    { id: "veyrn", haater: "veyrn", pt: "pacto", gloss: "vinculo preso / pacto", reverse: ["pacto", "vinculo"], fragment: "inner-weight" },
    { id: "kaern", haater: "kaern", pt: "culpa", gloss: "peso no sangue / culpa", reverse: ["culpa"], fragment: "inner-weight" },
    { id: "kharal", haater: "kharal", pt: "perda", gloss: "perda / queda parcial", reverse: ["perda"], fragment: "inner-weight" },
    { id: "savana", haater: "savana", pt: "esquecimento", gloss: "memoria negada / esquecimento", reverse: ["esquecimento"], fragment: "inner-weight" },
    { id: "savar", haater: "savar", pt: "lembranca viva", gloss: "memoria ativa / lembranca viva", reverse: ["lembranca viva", "lembranca"], fragment: "inner-weight" },
    { id: "orakh", haater: "orakh", pt: "pressagio", gloss: "sinal ruim / aviso antes", reverse: ["pressagio"], fragment: "inner-weight" },
    { id: "drun", haater: "drun", pt: "fim fechado", gloss: "fim encerrado / sem retorno", reverse: ["fim fechado"], fragment: "inner-weight" },
    { id: "cer", haater: "cer", pt: "certo", gloss: "certo / fixo / sem desvio", reverse: ["certo", "fixo"], fragment: "inner-weight" },
    { id: "vrak", haater: "vrak", pt: "erro", gloss: "falha / corte errado", reverse: ["erro", "falha"], fragment: "inner-weight" },
    { id: "vahrak", haater: "vahrak", pt: "escolha", gloss: "escolha / vontade feita gesto", reverse: ["escolha"], fragment: "inner-weight" },
    { id: "cerun", haater: "cerun", pt: "destino", gloss: "certeza longa / destino", reverse: ["destino"], fragment: "inner-weight" },
    { id: "tha", haater: "tha", pt: "voce", gloss: "tu / voce / aquele que escuta", reverse: ["tu", "voce"], fragment: "staying-people" },
    { id: "sha", haater: "sha", pt: "ele", gloss: "ele / ela / essa presenca", reverse: ["ele", "ela"], fragment: "staying-people" },
    { id: "shen", haater: "shen", pt: "eles", gloss: "eles / elas / presencas reunidas", reverse: ["eles", "elas"], fragment: "staying-people" },
    { id: "han", haater: "han", pt: "isso", gloss: "isso / coisa diante da fala", reverse: ["isso"], fragment: "staying-people" },
    { id: "naren", haater: "naren", pt: "povo", gloss: "nosso coletivo / povo", reverse: ["povo"], fragment: "staying-people" },
    { id: "ithen", haater: "ithen", pt: "crianca", gloss: "pequeno ser / crianca", reverse: ["crianca"], fragment: "staying-people" },
    { id: "uren", haater: "uren", pt: "anciao", gloss: "antigo vivo / anciao", reverse: ["anciao"], fragment: "staying-people" },
    { id: "thurak", haater: "thurak", pt: "aliado", gloss: "aquele que permanece junto", reverse: ["aliado"], fragment: "staying-people" },
    { id: "khor", haater: "khor", pt: "inimigo", gloss: "presenca contra / inimigo", reverse: ["inimigo"], fragment: "staying-people" },
    { id: "kharen", haater: "kharen", pt: "morto", gloss: "aquele que caiu / morto", reverse: ["morto"], fragment: "staying-people" },
    { id: "vadrak", haater: "vadrak", pt: "guardiao", gloss: "aquele que guarda", reverse: ["guardiao"], fragment: "staying-people" },
    { id: "zavren", haater: "zavren", pt: "leitor", gloss: "aquele que le rastros", reverse: ["leitor"], fragment: "staying-people" },
    { id: "varnak", haater: "varnak", pt: "escriba", gloss: "aquele que escreve", reverse: ["escriba"], fragment: "staying-people" },
    { id: "othar", haater: "othar", pt: "estranho", gloss: "outro demais / estranho", reverse: ["estranho"], fragment: "staying-people" },
    { id: "drathak", haater: "drathak", pt: "mestre", gloss: "base que ensina / mestre", reverse: ["mestre"], fragment: "staying-people" },
    { id: "vael", haater: "vael", pt: "branco", gloss: "claro frio / branco", reverse: ["branco"], fragment: "cold-colors" },
    { id: "mornak", haater: "mornak", pt: "preto", gloss: "escuro fechado / preto", reverse: ["preto"], fragment: "cold-colors" },
    { id: "kaelar", haater: "kaelar", pt: "vermelho", gloss: "cor de sangue / vermelho", reverse: ["vermelho"], fragment: "cold-colors" },
    { id: "nethvior", haater: "nethvior", pt: "azul", gloss: "roxo frio / azul escuro", reverse: ["azul", "azul escuro"], fragment: "cold-colors" },
    { id: "saelth", haater: "saelth", pt: "dourado", gloss: "luz de metal / dourado", reverse: ["dourado"], fragment: "cold-colors" },
    { id: "daln", haater: "daln", pt: "cinza", gloss: "cor de cinza fria", reverse: ["cinza"], fragment: "cold-colors" },
    { id: "veyral", haater: "veyral", pt: "verde", gloss: "cor de raiz / verde escuro", reverse: ["verde"], fragment: "cold-colors" }
  ];

  const PHRASEBOOK = [
    { haater: "khar na corre.", pt: "a morte nao corre." },
    { haater: "khar na veth.", pt: "a morte nao chama." },
    { haater: "khar espera.", pt: "a morte espera." },
    { haater: "khar vara.", pt: "a morte espera." },
    { haater: "ik sava saar.", pt: "eu lembro da chama." },
    { haater: "kael en drath.", pt: "sangue na pedra." },
    { haater: "esh khar.", pt: "o nome caiu." },
    { haater: "saar thur.", pt: "a chama permanece." },
    { haater: "ruun aer.", pt: "a ruina veio." },
    { haater: "thal vior thur.", pt: "a armadura roxa permanece." },
    { haater: "na zor esh.", pt: "nao vejo o nome." },
    { haater: "siv veth va esh, sile.", pt: "no primeiro chamado do nome, cale." },
    { haater: "tor aer va esh, vara.", pt: "ao segundo retorno do nome, espere." },
    { haater: "zor quando esh sorn tavar.", pt: "repare quando teu nome soar tarde." },
    { haater: "seln esh como na ik.", pt: "escute o nome como se nao fosse teu." },
    { haater: "vek esh aer va neth, sile.", pt: "se teu nome vier do silencio, cale." },
    { haater: "oren esh falha, reku.", pt: "onde teu nome falhar, recue." },
    { haater: "nurk sen esh ao morn.", pt: "nunca devolva teu nome ao escuro." },
    { haater: "lar esh khar en sorn orun.", pt: "deixe teu nome morrer sozinho no eco." },
    { haater: "hela aer preth va talm.", pt: "o frio entra antes da dor." },
    { haater: "khar aer preth va gath.", pt: "a queda comeca antes do golpe." },
    { haater: "khar keth.", pt: "a morte so confirma." },
    { haater: "hela dei vorn.", pt: "frio sem vento.", requiresFragments: ["absent-wind"] },
    { haater: "nethar aer.", pt: "o silencio absoluto vem.", requiresFragments: ["absent-wind"] },
    { haater: "reth ek drath thur.", pt: "a brasa e a pedra permanecem.", requiresFragments: ["absent-wind"] },
    { haater: "veyr ul drath.", pt: "a raiz sob a pedra.", requiresFragments: ["absent-wind"] },
    { haater: "garn zavar varn.", pt: "a mao estuda o registro.", requiresFragments: ["absent-wind"] },
    { haater: "varnar thur.", pt: "a escrita permanece.", requiresFragments: ["absent-wind"] },
    { haater: "akh drok.", pt: "dentro fecha.", requiresFragments: ["absent-wind"] },
    { haater: "arakh na vrok.", pt: "fora nao abre.", requiresFragments: ["absent-wind"] },
    { haater: "kharun vara.", pt: "a morte antiga espera.", requiresFragments: ["absent-wind"] },
    { haater: "na raak. na veth. keth.", pt: "nao corre. nao chama. confirma.", requiresFragments: ["absent-wind"] },
    { haater: "ath dar.", pt: "agora ja.", requiresFragments: ["dry-words"] },
    { haater: "ren toren.", pt: "novamente, entao.", requiresFragments: ["dry-words"] },
    { haater: "ulm thes.", pt: "inteiro e mesmo.", requiresFragments: ["dry-words"] },
    { haater: "oth nek.", pt: "outro pouco.", requiresFragments: ["dry-words"] },
    { haater: "drokth na vrok dei vekr.", pt: "o lacre nao abre sem chave.", requiresFragments: ["path-seal"] },
    { haater: "rhast en rhastvarn.", pt: "o caminho no mapa.", requiresFragments: ["path-seal"] },
    { haater: "korak thur.", pt: "a marca permanece.", requiresFragments: ["path-seal"] },
    { haater: "dal en grom.", pt: "cinza fria na ferrugem.", requiresFragments: ["cold-matter"] },
    { haater: "lum thur.", pt: "a luz fraca permanece.", requiresFragments: ["cold-matter"] },
    { haater: "helk en durn.", pt: "gelo na terra.", requiresFragments: ["cold-matter"] },
    { haater: "helna va aern.", pt: "neve do ceu.", requiresFragments: ["cold-matter"] },
    { haater: "halm sek.", pt: "o folego curto treme.", requiresFragments: ["broken-body"] },
    { haater: "mir en skar.", pt: "arrepio na pele.", requiresFragments: ["broken-body"] },
    { haater: "gorl na veth.", pt: "a garganta nao chama.", requiresFragments: ["broken-body"] },
    { haater: "selak seln.", pt: "o ouvido escuta.", requiresFragments: ["broken-body"] },
    { haater: "treth thur.", pt: "a verdade permanece.", requiresFragments: ["inner-weight"] },
    { haater: "vrel khar.", pt: "a mentira cai.", requiresFragments: ["inner-weight"] },
    { haater: "tevr en kaern.", pt: "medo na culpa.", requiresFragments: ["inner-weight"] },
    { haater: "orakh dar.", pt: "o pressagio ja veio.", requiresFragments: ["inner-weight"] },
    { haater: "naren thur.", pt: "o povo permanece.", requiresFragments: ["staying-people"] },
    { haater: "uren sava. ithen zor.", pt: "o anciao lembra. a crianca ve.", requiresFragments: ["staying-people"] },
    { haater: "zavren zor.", pt: "o leitor ve.", requiresFragments: ["staying-people"] },
    { haater: "varnak varnar.", pt: "o escriba escreve.", requiresFragments: ["staying-people"] },
    { haater: "vael lum.", pt: "branco de luz fraca.", requiresFragments: ["cold-colors"] },
    { haater: "mornak thur.", pt: "o preto permanece.", requiresFragments: ["cold-colors"] },
    { haater: "kaelar en daln.", pt: "vermelho no cinza.", requiresFragments: ["cold-colors"] },
    { haater: "veyral ul drath.", pt: "verde sob a pedra.", requiresFragments: ["cold-colors"] },

    { haater: "ik sava ruun.", pt: "eu lembro da ruina.", requiresFragments: ["book1"] },
    { haater: "rethen na khar.", pt: "as brasas nao cairam.", requiresFragments: ["book1"] },
    { haater: "ik ith.", pt: "eu era pequeno.", requiresFragments: ["book1"] },
    { haater: "tir sen.", pt: "a noite era grande.", requiresFragments: ["book1"] },
    { haater: "drath drae.", pt: "a pedra pesava.", requiresFragments: ["book1"] },
    { haater: "morn en saar.", pt: "sombra na chama.", requiresFragments: ["book1"] },
    { haater: "vel khar cedo.", pt: "a vida caiu cedo.", requiresFragments: ["book1"] },
    { haater: "esh nar khar.", pt: "os nossos nomes cairam.", requiresFragments: ["book1"] },
    { haater: "voz nar na thur.", pt: "as vozes nao ficaram.", requiresFragments: ["book1"] },
    { haater: "so eco.", pt: "so o eco.", requiresFragments: ["book1"] },
    { haater: "sa mao dren ik.", pt: "uma mao me arrancou dali.", requiresFragments: ["book1"] },
    { haater: "sa mao fecha ik.", pt: "uma mao me fechou em silencio.", requiresFragments: ["book1"] },
    { haater: "ik na grita.", pt: "eu nao gritei.", requiresFragments: ["book1"] },
    { haater: "ik corre.", pt: "eu corri.", requiresFragments: ["book1"] },
    { haater: "drath na abre.", pt: "a terra nao se abriu.", requiresFragments: ["book1"] },
    { haater: "ruun aer atras.", pt: "a ruina vinha atras.", requiresFragments: ["book1"] },
    { haater: "saar sobe.", pt: "a chama subiu.", requiresFragments: ["book1"] },
    { haater: "morn come.", pt: "a sombra engoliu.", requiresFragments: ["book1"] },
    { haater: "kael responde.", pt: "o sangue respondeu.", requiresFragments: ["book1"] },
    { haater: "ik sava na rosto.", pt: "eu nao lembro dos rostos.", requiresFragments: ["book1"] },
    { haater: "ik sava na esh.", pt: "eu nao lembro dos nomes.", requiresFragments: ["book1"] },
    { haater: "mas ik sava fim.", pt: "mas eu lembro do fim.", requiresFragments: ["book1"] },
    { haater: "ur nar khar.", pt: "os antigos cairam.", requiresFragments: ["book1"] },
    { haater: "rethen nar thur.", pt: "as brasas ficaram.", requiresFragments: ["book1"] },
    { haater: "ik thur.", pt: "eu fiquei.", requiresFragments: ["book1"] },
    { haater: "se sa zora varn, zora rastro.", pt: "se alguem encontrar este escrito, encontrara um rastro.", requiresFragments: ["book1"] },
    { haater: "na verdade. so brasa.", pt: "nao a verdade. so a brasa.", requiresFragments: ["book1"] },

    { haater: "thal na guarda ik.", pt: "a armadura nao me guarda.", requiresFragments: ["book2"] },
    { haater: "ik guarda thal.", pt: "eu e que guardo a armadura.", requiresFragments: ["book2"] },
    { haater: "ur, thal era peso.", pt: "antes, ela era peso.", requiresFragments: ["book2"] },
    { haater: "agora, thal fala antes de ik.", pt: "agora, fala antes de mim.", requiresFragments: ["book2"] },
    { haater: "sa zora vior, sa recua.", pt: "quem ve o roxo, recua.", requiresFragments: ["book2"] },
    { haater: "sa cala.", pt: "se cala.", requiresFragments: ["book2"] },
    { haater: "ik na sava o que veem.", pt: "eu nao sei o que enxergam.", requiresFragments: ["book2"] },
    { haater: "mas veem algo.", pt: "mas enxergam alguma coisa.", requiresFragments: ["book2"] },
    { haater: "antes de esh.", pt: "antes do nome.", requiresFragments: ["book2"] },
    { haater: "kael seca.", pt: "o sangue seca.", requiresFragments: ["book2"] },
    { haater: "reth dorme.", pt: "a brasa dorme.", requiresFragments: ["book2"] },
    { haater: "thal thur.", pt: "o metal permanece.", requiresFragments: ["book2"] },
    { haater: "ur ik corria.", pt: "antes eu corria.", requiresFragments: ["book2"] },
    { haater: "ur ik falava mais.", pt: "antes eu falava mais.", requiresFragments: ["book2"] },
    { haater: "agora ik escuta pedra.", pt: "agora eu escuto a pedra.", requiresFragments: ["book2"] },
    { haater: "morn anda com ik.", pt: "a sombra anda comigo.", requiresFragments: ["book2"] },
    { haater: "na como dona.", pt: "nao como dona.", requiresFragments: ["book2"] },
    { haater: "como sinal.", pt: "como sinal.", requiresFragments: ["book2"] },
    { haater: "anos na levam ik.", pt: "os anos nao me levam.", requiresFragments: ["book2"] },
    { haater: "anos entram ik.", pt: "os anos entram em mim.", requiresFragments: ["book2"] },
    { haater: "ficam.", pt: "e ficam.", requiresFragments: ["book2"] },
    { haater: "sa chama.", pt: "alguns chamam.", requiresFragments: ["book2"] },
    { haater: "sa teme.", pt: "alguns temem.", requiresFragments: ["book2"] },
    { haater: "ik na pergunto esh.", pt: "eu nao pergunto o nome.", requiresFragments: ["book2"] },
    { haater: "thal vior na e gloria.", pt: "a armadura roxa nao e gloria.", requiresFragments: ["book2"] },
    { haater: "na e paz.", pt: "nao e paz.", requiresFragments: ["book2"] },
    { haater: "e so o que ficou.", pt: "e so o que ficou.", requiresFragments: ["book2"] }
  ].map(function (phrase) {
    return Object.assign({}, phrase, {
      haaterKey: normalize(phrase.haater),
      ptKey: normalize(phrase.pt)
    });
  });

  const EXAMPLES = [
    "Khar na corre.",
    "Kael en drath.",
    "Vek esh aer va neth, sile.",
    "Nunca devolva teu nome ao escuro.",
    "A morte espera.",
    "Afaste-se antes de responder ao nome."
  ];
  const LOST_HINTS = [
    "Dica I: o site nao cria a pista. Procure primeiro uma linha em Haater nos posts, imagens ou documentos do ARG.",
    "Dica II: cole a linha na Mesa de Traducao. Palavras repetidas quase sempre sao mais importantes do que frases bonitas.",
    "Dica III: se a Margem do Artefato disser que uma folha pode ceder, clique em Registrar estudo.",
    "Dica IV: se uma frase parecer curta, ritual e completa, teste no Lacre Ritual.",
    "Dica V: anote teorias por folha. O padrao aparece melhor quando voces comparam brasa, pedra, sombra, nome e frio.",
    "Dica VI: nao tente forcar o nome cedo demais. Algumas palavras foram feitas para voltar tarde."
  ];

  const TOTAL_PAGE_COUNT = FRAGMENTS.reduce(function (total, fragment) {
    return total + fragment.pages.length;
  }, 0);
  const HISTORY_LIMIT = 120;
  const NOTE_TYPES = [
    { id: "teoria", label: "Teoria" },
    { id: "traducao", label: "Traducao" },
    { id: "suspeita", label: "Suspeita" },
    { id: "pista", label: "Pista" }
  ];
  const NOTE_TYPE_MAP = new Map(NOTE_TYPES.map(function (type) {
    return [type.id, type];
  }));
  const RARE_REACTIONS = [
    {
      id: "rare-certainty",
      patterns: ["khar na corre."],
      message: "essa linha costuma voltar primeiro quando o volume quer lembrar que a morte nao se apressa.",
      type: "warn",
      title: "linha da certeza"
    },
    {
      id: "rare-name-dark",
      patterns: ["nurk sen esh ao morn."],
      message: "nao devolva o nome ao escuro. essa margem ja foi sublinhada mais de uma vez.",
      type: "error",
      title: "advertencia do nome"
    },
    {
      id: "rare-embers",
      patterns: ["rethen na khar.", "ik thur."],
      requireAll: true,
      message: "o volume ficou menos frio por um instante. brasas e permanencia quase sempre aparecem juntas.",
      type: "success",
      title: "brasa que ficou"
    },
    {
      id: "rare-violet",
      patterns: ["thal vior na e gloria."],
      message: "o metal recusou gloria outra vez. isto parece menos memoria e mais aviso.",
      type: "warn",
      title: "armadura recusada"
    },
    {
      id: "rare-silence",
      patterns: ["vek esh aer va neth, sile."],
      message: "o silencio respondeu antes da traducao completa. convem nao repetir essa linha em voz alta.",
      type: "error",
      title: "silencio do nome"
    },
    {
      id: "rare-dry-return",
      patterns: ["ath dar.", "ren toren."],
      requireAll: true,
      message: "a linha voltou como se ja estivesse atrasada. o agora, no Haater, parece resto e nao presente.",
      type: "warn",
      title: "agora atrasado"
    },
    {
      id: "rare-sealed-door",
      patterns: ["drokth na vrok dei vekr."],
      message: "o lacre reconheceu a ausencia da chave. nao houve abertura; so confirmacao.",
      type: "warn",
      title: "porta que sabe"
    },
    {
      id: "rare-cold-ash",
      patterns: ["dal en grom.", "lum thur."],
      requireAll: true,
      message: "a cinza fria segurou uma luz pequena demais para iluminar. ainda assim, ela ficou.",
      type: "success",
      title: "luz na ferrugem"
    },
    {
      id: "rare-broken-body",
      patterns: ["halm sek.", "mir en skar."],
      requireAll: true,
      message: "o corpo respondeu antes da traducao. tremor, pele e folego curto chegaram na ordem errada.",
      type: "error",
      title: "corpo antecipado"
    },
    {
      id: "rare-inner-weight",
      patterns: ["treth thur.", "vrel khar."],
      requireAll: true,
      message: "a verdade ficou pesada demais para sair. a mentira caiu sem fazer som.",
      type: "warn",
      title: "peso da verdade"
    },
    {
      id: "rare-people-stayed",
      patterns: ["naren thur.", "uren sava.", "ithen zor."],
      requireAll: true,
      message: "o povo respondeu em tres tempos: quem fica, quem lembra, quem ainda ve.",
      type: "success",
      title: "povo que ficou"
    },
    {
      id: "rare-cold-colors",
      patterns: ["vael lum.", "mornak thur."],
      requireAll: true,
      message: "a cor voltou fria. branco virou luz fraca; preto virou permanencia.",
      type: "warn",
      title: "pigmento apagado"
    }
  ].map(function (reaction) {
    return Object.assign({}, reaction, {
      patterns: reaction.patterns.map(normalize)
    });
  });
  const SECRET_TEXTS = [
    {
      id: "secret-certainty",
      reactionId: "rare-certainty",
      order: 1,
      label: "margem velada I",
      title: "a certeza nao corre",
      haater: "Khar na corre.\nKhar na chama.\nKhar espera.",
      portuguese: "A morte nao corre.\nA morte nao chama.\nA morte espera.",
      note: "O volume nao trata isso como profecia. Trata como observacao antiga demais para discutir."
    },
    {
      id: "secret-embers",
      reactionId: "rare-embers",
      order: 2,
      label: "margem velada II",
      title: "a brasa que recusou queda",
      haater: "Rethen na khar.\nReth thur.\nIk thur.",
      portuguese: "As brasas nao cairam.\nA brasa permaneceu.\nEu permaneci.",
      note: "Este resto soa pessoal demais para ser so vocabulario. Solin registra permanencia como sobra, nao como vitoria."
    },
    {
      id: "secret-name",
      reactionId: "rare-name-dark",
      order: 3,
      label: "margem velada III",
      title: "o nome nao volta inteiro",
      haater: "Esh pesa.\nSe esh soar longe, na responda.\nMorn guarda o resto.",
      portuguese: "O nome pesa.\nSe teu nome soar longe, nao responda.\nA sombra guarda o resto.",
      note: "O manuscrito trata resposta errada como entrega. O nome falha antes do corpo."
    },
    {
      id: "secret-violet",
      reactionId: "rare-violet",
      order: 4,
      label: "margem velada IV",
      title: "o metal ficou no lugar da voz",
      haater: "Thal vior na e gloria.\nNa e paz.\nE so o que ficou.",
      portuguese: "A armadura roxa nao e gloria.\nNao e paz.\nE so o que ficou.",
      note: "O violeta nao celebra. Ele marca sobrevivencia endurecida, quase sem resto humano."
    },
    {
      id: "secret-silence",
      reactionId: "rare-silence",
      order: 5,
      label: "margem velada V",
      title: "o silencio chega cedo",
      haater: "Hela en vel.\nSom na thur.\nKhar toma pelo certo.",
      portuguese: "O frio entra no folego.\nO som nao fica.\nA morte toma pela certeza.",
      note: "O golpe nao aparece aqui. So os sinais que chegam cedo demais e deixam o resto atrasado."
    },
    {
      id: "secret-dry-return",
      reactionId: "rare-dry-return",
      order: 6,
      label: "margem velada VI",
      title: "o agora veio velho",
      haater: "Ath dar.\nRen toren.\nSivath na vara ik.",
      portuguese: "Agora ja.\nNovamente, entao.\nO instante nao espera por mim.",
      note: "Solin nao trata tempo como linha. Para ele, algumas coisas chegam depois, mas sempre pareceram ter estado ali."
    },
    {
      id: "secret-sealed-door",
      reactionId: "rare-sealed-door",
      order: 7,
      label: "margem velada VII",
      title: "a porta nao queria abrir",
      haater: "Drokth thur.\nVekr ora.\nGorn seln dei sorn.",
      portuguese: "O lacre permanece.\nA chave esta perto.\nA porta escuta sem som.",
      note: "A abertura nao e premio. No Haater, uma porta pode saber mais fechada do que aberta."
    },
    {
      id: "secret-cold-ash",
      reactionId: "rare-cold-ash",
      order: 8,
      label: "margem velada VIII",
      title: "a luz que sobrou na ferrugem",
      haater: "Dal en grom.\nLum thur.\nSaar na aer ulm.",
      portuguese: "Cinza fria na ferrugem.\nA luz fraca permanece.\nA chama nao volta inteira.",
      note: "Este resto parece uma regra de ruina: nem toda luz quer salvar; algumas apenas provam que algo queimou."
    },
    {
      id: "secret-broken-body",
      reactionId: "rare-broken-body",
      order: 9,
      label: "margem velada IX",
      title: "o corpo soube primeiro",
      haater: "Halm sek.\nMir en skar.\nGorl na veth.",
      portuguese: "O folego curto treme.\nArrepio na pele.\nA garganta nao chama.",
      note: "Quando a Entidade esta perto, o corpo nao explica. Ele reduz movimento, som e ar."
    },
    {
      id: "secret-inner-weight",
      reactionId: "rare-inner-weight",
      order: 10,
      label: "margem velada X",
      title: "a mentira sem chao",
      haater: "Treth thur.\nVrel khar.\nCerun na raak.",
      portuguese: "A verdade permanece.\nA mentira cai.\nO destino nao corre.",
      note: "A certeza aparece como peso antigo. Nao empurra, nao corre, nao convence. Apenas fica ate o resto ceder."
    },
    {
      id: "secret-people-stayed",
      reactionId: "rare-people-stayed",
      order: 11,
      label: "margem velada XI",
      title: "quem lembra e quem ve",
      haater: "Naren thur.\nUren sava.\nIthen zor.",
      portuguese: "O povo permanece.\nO anciao lembra.\nA crianca ve.",
      note: "Isto parece menos historia e mais metodo. Um povo sobrevive quando uma memoria antiga encontra um olhar novo."
    },
    {
      id: "secret-cold-colors",
      reactionId: "rare-cold-colors",
      order: 12,
      label: "margem velada XII",
      title: "cor sem vida",
      haater: "Vael lum.\nMornak thur.\nVeyral ul drath.",
      portuguese: "Branco de luz fraca.\nO preto permanece.\nVerde sob a pedra.",
      note: "As cores nao enfeitam o texto. Elas localizam restos: luz, sombra, sangue, metal e raiz."
    }
  ];

  const CONTEXT_STAGES = [
    {
      id: "context-links",
      title: "costuras de ligacao",
      note: "Palavras pequenas que unem, cortam ou negam sentido. Elas quase nunca parecem importantes ate uma frase depender delas.",
      words: ["ek", "ao", "kam", "dei", "dran", "mak", "ka"]
    },
    {
      id: "context-places",
      title: "lugares sem vento",
      note: "Direcao, distancia e interior. A lingua trata lugar como pressao no corpo, nao como mapa bonito.",
      words: ["vak", "torak", "orah", "akh", "arakh", "ul", "athar"]
    },
    {
      id: "context-sky",
      title: "ceu frio",
      note: "Natureza alta e materia de luz. Procure o que cai, o que brilha e o que se move sem voz.",
      words: ["vorn", "vash", "vashar", "aern", "nora", "sael", "thir", "saelar"]
    },
    {
      id: "context-body-remains",
      title: "corpo que sobrou",
      note: "Partes do corpo aparecem como resto fisico: mao, olho, pele, osso e aquilo que ainda carrega calor.",
      words: ["garn", "zorak", "skar", "karn", "farn", "thok", "gorl", "selak", "garnath", "drek", "kora"]
    },
    {
      id: "context-gestures",
      title: "gestos e cortes",
      note: "Acoes basicas, mas secas: andar, abrir, fechar, guardar, quebrar, escrever e esconder.",
      words: ["raak", "vand", "vrok", "drok", "vadr", "trak", "kesh", "varnar", "zavar", "mornar"]
    },
    {
      id: "context-silence-time",
      title: "silencio, peso e tempo",
      note: "Aqui o idioma fica mais calculado. Leve, grave, segredo, morte antiga e tempo chegam como sintomas.",
      words: ["lom", "gor", "nethar", "nethal", "kharun", "toren", "thak", "nusa", "ulm", "oth", "thes", "drom", "nek", "ath", "dar", "ren", "sivath"]
    },
    {
      id: "context-path-seal",
      title: "porta e rastro",
      note: "Mapa, porta, lacre e chave. Nem toda abertura e libertacao; algumas so confirmam que havia selo.",
      words: ["rhast", "gorn", "sharn", "rhastvarn", "vekr", "drokth", "korak"]
    },
    {
      id: "context-cold-matter",
      title: "materia fria",
      note: "Coisas de cenario entram como resto: terra, madeira, folha, ferrugem, cinza fria, gelo, neve e calor.",
      words: ["durn", "tharn", "lath", "grom", "dal", "lum", "helk", "helna", "saaren", "sakh", "vashn"]
    },
    {
      id: "context-body-signals",
      title: "sinais do corpo",
      note: "Quando a Entidade esta perto, o corpo entende antes da fala. Folego, tremor, pele e movimento viram aviso.",
      words: ["halm", "sek", "mir", "dorn", "morak", "zorva", "garnen", "tharnak", "sov", "darun", "larun"]
    },
    {
      id: "context-inner-one",
      title: "peso interior I",
      note: "Medo, raiva, luto e verdade nao aparecem como filosofia. Aparecem como peso que fica.",
      words: ["tevr", "krav", "valm", "rethar", "vayn", "glor", "treth", "vrel", "thurv", "veyrn"]
    },
    {
      id: "context-inner-two",
      title: "peso interior II",
      note: "Culpa, perda, esquecimento, pressagio, erro e destino. Aqui a certeza fala baixo.",
      words: ["kaern", "kharal", "savana", "savar", "orakh", "drun", "cer", "vrak", "vahrak", "cerun"]
    },
    {
      id: "context-people",
      title: "povo que ficou",
      note: "Pessoas e papeis aparecem como posicao no estudo: quem guarda, quem le, quem escreve, quem ensina.",
      words: ["tha", "sha", "shen", "han", "naren", "ithen", "uren", "thurak", "khor", "kharen", "vadrak", "zavren", "varnak", "othar", "drathak"]
    },
    {
      id: "context-colors",
      title: "cores frias",
      note: "Cor, no Haater, nao enfeita. Ela localiza resto: luz, sangue, sombra, raiz e metal.",
      words: ["vael", "mornak", "kaelar", "nethvior", "saelth", "daln", "veyral"]
    }
  ];

  const FRAGMENT_BY_ID = new Map();
  const PAGE_BY_ID = new Map();
  const PAGE_TRIGGER_TO_PAGES = new Map();
  const HAATER_TO_ENTRY = new Map();
  const PT_TO_ENTRY = new Map();
  const SECRET_BY_ID = new Map();
  const SECRET_BY_REACTION_ID = new Map();
  const HAATER_WORDS = new Set();
  const PT_WORDS = new Set();
  const HAATER_EXACT = new Map();
  const PT_EXACT = new Map();
  const ARTICLES_TO_DROP = new Set(["o", "a", "os", "as", "um", "uma", "uns", "umas"]);
  const PT_HINTS = new Set(["de", "do", "da", "que", "com", "como", "teu", "tua", "seu", "sua", "ela", "ele", "antes", "depois"]);

  for (const secret of SECRET_TEXTS) {
    SECRET_BY_ID.set(secret.id, secret);
    if (secret.reactionId) {
      SECRET_BY_REACTION_ID.set(secret.reactionId, secret);
    }
  }

  for (const fragment of FRAGMENTS) {
    FRAGMENT_BY_ID.set(fragment.id, fragment);
    for (const page of fragment.pages) {
      const pageRecord = Object.assign({}, page, {
        fragmentId: fragment.id,
        fragmentTitle: fragment.title,
        fragmentOrder: fragment.order
      });
      PAGE_BY_ID.set(page.id, pageRecord);
      for (const trigger of page.studyTriggers || []) {
        const key = normalize(trigger);
        if (!key) {
          continue;
        }
        if (!PAGE_TRIGGER_TO_PAGES.has(key)) {
          PAGE_TRIGGER_TO_PAGES.set(key, []);
        }
        PAGE_TRIGGER_TO_PAGES.get(key).push(pageRecord);
      }
    }
  }

  for (const entry of LEXICON) {
    HAATER_TO_ENTRY.set(entry.haater, entry);
    HAATER_WORDS.add(entry.haater);
    PT_WORDS.add(normalize(entry.pt));

    for (const alias of entry.reverse) {
      PT_TO_ENTRY.set(normalize(alias), entry);
      PT_WORDS.add(normalize(alias));
    }
  }

  for (const phrase of PHRASEBOOK) {
    phrase.requiredWords = Array.isArray(phrase.requiresWords) ? phrase.requiresWords : collectPhraseRequirements(phrase.haater);
    phrase.requiredFragments = Array.isArray(phrase.requiresFragments) ? phrase.requiresFragments : [];
    phrase.requiredPages = [];

    const pageCandidates = []
      .concat(PAGE_TRIGGER_TO_PAGES.get(phrase.haaterKey) || [])
      .concat(PAGE_TRIGGER_TO_PAGES.get(phrase.ptKey) || []);

    const page = pageCandidates.find(function (candidate) {
      return !phrase.requiredFragments.length || phrase.requiredFragments.includes(candidate.fragmentId);
    }) || pageCandidates[0];

    if (page) {
      phrase.requiredPages = [page.id];
      if (!phrase.requiredFragments.includes(page.fragmentId)) {
        phrase.requiredFragments = phrase.requiredFragments.concat([page.fragmentId]);
      }
    }

    HAATER_EXACT.set(phrase.haaterKey, phrase);
    PT_EXACT.set(phrase.ptKey, phrase);
  }

  const sourceLanguage = document.getElementById("sourceLanguage");
  const targetLanguage = document.getElementById("targetLanguage");
  const sourceText = document.getElementById("sourceText");
  const targetText = document.getElementById("targetText");
  const workspace = document.getElementById("workspace");
  const openVolumeButton = document.getElementById("openVolumeButton");
  const insertGuideExample = document.getElementById("insertGuideExample");
  const lostButton = document.getElementById("lostButton");
  const lostHint = document.getElementById("lostHint");
  const swapButton = document.getElementById("swapButton");
  const clearButton = document.getElementById("clearButton");
  const copyButton = document.getElementById("copyButton");
  const studyButton = document.getElementById("studyButton");
  const detectedLanguage = document.getElementById("detectedLanguage");
  const confidenceValue = document.getElementById("confidenceValue");
  const translationMode = document.getElementById("translationMode");
  const artifactMessage = document.getElementById("artifactMessage");
  const matchesList = document.getElementById("matchesList");
  const exampleList = document.getElementById("exampleList");
  const unlockCode = document.getElementById("unlockCode");
  const unlockButton = document.getElementById("unlockButton");
  const resetProgressButton = document.getElementById("resetProgressButton");
  const unlockMessage = document.getElementById("unlockMessage");
  const progressWords = document.getElementById("progressWords");
  const progressFragments = document.getElementById("progressFragments");
  const progressPages = document.getElementById("progressPages");
  const contextStudyList = document.getElementById("contextStudyList");
  const fragmentList = document.getElementById("fragmentList");
  const recoveredLibrary = document.getElementById("recoveredLibrary");
  const marginNotes = document.getElementById("marginNotes");
  const noteTarget = document.getElementById("noteTarget");
  const noteType = document.getElementById("noteType");
  const noteFilter = document.getElementById("noteFilter");
  const noteInput = document.getElementById("noteInput");
  const saveNoteButton = document.getElementById("saveNoteButton");
  const clearNoteButton = document.getElementById("clearNoteButton");
  const noteStatus = document.getElementById("noteStatus");
  const noteCount = document.getElementById("noteCount");
  const exportNotebookButton = document.getElementById("exportNotebookButton");
  const historyList = document.getElementById("historyList");
  const secretArchive = document.getElementById("secretArchive");
  const secretCount = document.getElementById("secretCount");
  const helpButton = document.getElementById("helpButton");
  const helpModal = document.getElementById("helpModal");
  const helpBackdrop = document.getElementById("helpBackdrop");
  const helpCloseButton = document.getElementById("helpCloseButton");
  const studyLayout = document.querySelector(".study-layout");
  const studyNavButtons = Array.from(document.querySelectorAll("[data-study-target]"));
  const studyPanels = Array.from(document.querySelectorAll("[data-study-panel]"));

  let progress = loadProgress();
  const noteUiState = {
    selectedPageId: "",
    drafts: {}
  };
  const sessionState = {
    lastRareReactionId: "",
    lostHintIndex: 0
  };

  function fragmentForEntry(entry) {
    return entry ? FRAGMENT_BY_ID.get(entry.fragment) : null;
  }

  function lockedTokenForEntry(entry) {
    const fragment = fragmentForEntry(entry);
    return fragment && fragment.lockedToken ? fragment.lockedToken : LOCKED_TOKEN;
  }

  function collectPhraseRequirements(haaterText) {
    const requirements = new Set();
    for (const token of tokenize(haaterText)) {
      if (!isWord(token)) {
        continue;
      }
      const entry = HAATER_TO_ENTRY.get(normalize(token));
      if (entry) {
        requirements.add(entry.id);
      }
    }
    return Array.from(requirements);
  }

  function baseProgress() {
    const base = FRAGMENT_BY_ID.get("base");
    return {
      unlockedWordIds: new Set(base.words),
      unlockedFragmentIds: new Set(["base"]),
      unlockedPageIds: new Set(base.pages.map(function (page) { return page.id; })),
      unlockedSecretIds: new Set(),
      manualNotes: {},
      historyEntries: []
    };
  }

  function serializeProgress(state) {
    return {
      unlockedWordIds: Array.from(state.unlockedWordIds),
      unlockedFragmentIds: Array.from(state.unlockedFragmentIds),
      unlockedPageIds: Array.from(state.unlockedPageIds),
      unlockedSecretIds: Array.from(state.unlockedSecretIds),
      manualNotes: state.manualNotes,
      historyEntries: state.historyEntries
    };
  }

  function normalizeNoteType(value) {
    return NOTE_TYPE_MAP.has(value) ? value : "teoria";
  }

  function normalizeManualNoteRecord(value) {
    if (typeof value === "string") {
      return {
        text: value,
        type: "teoria",
        updatedAt: null
      };
    }

    if (!value || typeof value !== "object") {
      return {
        text: "",
        type: "teoria",
        updatedAt: null
      };
    }

    return {
      text: typeof value.text === "string" ? value.text : "",
      type: normalizeNoteType(value.type),
      updatedAt: typeof value.updatedAt === "number" ? value.updatedAt : null
    };
  }

  function normalizeManualNotes(source) {
    const notes = {};
    if (!source || typeof source !== "object") {
      return notes;
    }

    for (const pageId of Object.keys(source)) {
      const record = normalizeManualNoteRecord(source[pageId]);
      if (record.text.trim()) {
        notes[pageId] = record;
      }
    }
    return notes;
  }

  function loadProgress() {
    const base = baseProgress();
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return base;
      }

      const parsed = JSON.parse(raw);
      const state = {
        unlockedWordIds: new Set(Array.isArray(parsed.unlockedWordIds) ? parsed.unlockedWordIds : []),
        unlockedFragmentIds: new Set(Array.isArray(parsed.unlockedFragmentIds) ? parsed.unlockedFragmentIds : []),
        unlockedPageIds: new Set(Array.isArray(parsed.unlockedPageIds) ? parsed.unlockedPageIds : []),
        unlockedSecretIds: new Set(Array.isArray(parsed.unlockedSecretIds) ? parsed.unlockedSecretIds : []),
        manualNotes: normalizeManualNotes(parsed.manualNotes),
        historyEntries: Array.isArray(parsed.historyEntries) ? parsed.historyEntries : []
      };

      for (const word of base.unlockedWordIds) {
        state.unlockedWordIds.add(word);
      }
      state.unlockedFragmentIds.add("base");
      for (const pageId of base.unlockedPageIds) {
        state.unlockedPageIds.add(pageId);
      }

      return state;
    } catch (error) {
      return base;
    }
  }

  function saveProgress() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeProgress(progress)));
  }

  function historyMetaForKind(kind) {
    const meta = {
      fragment: { label: "fragmento aberto", mark: "FG", tone: "fragment" },
      word: { label: "palavra reconstruida", mark: "PL", tone: "word" },
      folio: { label: "folio recuperado", mark: "FL", tone: "folio" },
      note: { label: "margem salva", mark: "MG", tone: "note" },
      export: { label: "caderno exportado", mark: "AR", tone: "export" },
      reaction: { label: "eco raro", mark: "EC", tone: "reaction" },
      secret: { label: "texto velado", mark: "VL", tone: "secret" },
      reset: { label: "volume resetado", mark: "RS", tone: "reset" }
    };
    return meta[kind] || { label: "registro", mark: "--", tone: "generic" };
  }

  function historyTitleForKind(kind) {
    return historyMetaForKind(kind).label;
  }

  function addHistoryEntry(kind, title, detail) {
    progress.historyEntries.push({
      id: String(Date.now()) + "-" + Math.random().toString(16).slice(2, 8),
      kind: kind,
      title: title || historyTitleForKind(kind),
      detail: detail || "",
      timestamp: Date.now()
    });

    if (progress.historyEntries.length > HISTORY_LIMIT) {
      progress.historyEntries = progress.historyEntries.slice(-HISTORY_LIMIT);
    }

    saveProgress();
  }

  function isUnlockedWord(wordId) {
    return progress.unlockedWordIds.has(wordId);
  }

  function isUnlockedFragment(fragmentId) {
    return progress.unlockedFragmentIds.has(fragmentId);
  }

  function isUnlockedPage(pageId) {
    return progress.unlockedPageIds.has(pageId);
  }

  function isUnlockedSecret(secretId) {
    return progress.unlockedSecretIds.has(secretId);
  }

  function unlockPage(pageId) {
    if (!pageId || isUnlockedPage(pageId)) {
      return false;
    }
    progress.unlockedPageIds.add(pageId);
    saveProgress();
    return true;
  }

  function unlockFragment(fragment) {
    progress.unlockedFragmentIds.add(fragment.id);
    for (const wordId of fragment.words) {
      progress.unlockedWordIds.add(wordId);
    }
    if (fragment.pages.length) {
      progress.unlockedPageIds.add(fragment.pages[0].id);
    }
    saveProgress();
  }

  function maybeRecoverFragmentByContext(fragment) {
    if (!fragment || fragment.id === "base" || isUnlockedFragment(fragment.id) || !fragment.words.length) {
      return false;
    }

    const complete = fragment.words.every(function (wordId) {
      return isUnlockedWord(wordId);
    });

    if (!complete) {
      return false;
    }

    progress.unlockedFragmentIds.add(fragment.id);
    if (fragment.pages.length) {
      progress.unlockedPageIds.add(fragment.pages[0].id);
    }
    addHistoryEntry(
      "fragment",
      fragment.title,
      "A tabua foi reconstruida por contexto, sem frase-chave. Primeira folha recuperada: " + (fragment.pages[0] ? fragment.pages[0].folio : "folio I") + "."
    );
    return true;
  }

  function unlockWordByContext(entry) {
    if (!entry || isUnlockedWord(entry.id)) {
      return false;
    }

    progress.unlockedWordIds.add(entry.id);
    addHistoryEntry(
      "word",
      entry.haater + " = " + entry.pt,
      "Reconstruida por comparacao de contexto. Sentido ritual: " + entry.gloss + "."
    );
    maybeRecoverFragmentByContext(FRAGMENT_BY_ID.get(entry.fragment));
    saveProgress();
    return true;
  }

  function unlockSecret(secretId) {
    if (!secretId || isUnlockedSecret(secretId) || !SECRET_BY_ID.has(secretId)) {
      return false;
    }
    progress.unlockedSecretIds.add(secretId);
    saveProgress();
    return true;
  }

  function getManualNoteRecord(pageId) {
    return pageId && progress.manualNotes[pageId]
      ? normalizeManualNoteRecord(progress.manualNotes[pageId])
      : normalizeManualNoteRecord(null);
  }

  function getManualNote(pageId) {
    return getManualNoteRecord(pageId).text;
  }

  function getManualNoteType(pageId) {
    return getManualNoteRecord(pageId).type;
  }

  function setManualNote(pageId, value, type) {
    if (!pageId) {
      return;
    }
    const cleaned = value.trim();
    if (!cleaned) {
      delete progress.manualNotes[pageId];
    } else {
      progress.manualNotes[pageId] = {
        text: cleaned,
        type: normalizeNoteType(type),
        updatedAt: Date.now()
      };
    }
    saveProgress();
  }

  function resetProgress() {
    progress = baseProgress();
    saveProgress();
    addHistoryEntry("reset", "o volume voltou ao inicio", "Todo o progresso foi apagado e so a memoria basal permaneceu.");
    setUnlockMessage("Progresso resetado. O volume voltou ao indice inicial.", "success");
    setArtifactMessage("o resto voltou ao comeco.", "warn");
    updateAll();
  }

  function setUnlockMessage(message, type) {
    unlockMessage.textContent = message;
    unlockMessage.className = "unlock-message";
    if (type) {
      unlockMessage.classList.add(type);
    }
  }

  function setArtifactMessage(message, type) {
    artifactMessage.textContent = message;
    artifactMessage.className = "artifact-message";
    if (type) {
      artifactMessage.classList.add(type);
    }
  }

  function describeArtifactState(result, inputText) {
    if (!inputText.trim()) {
      return {
        message: "o volume espera fechado.",
        type: ""
      };
    }

    const rareReaction = rareReactionForInput(inputText);
    if (rareReaction) {
      return {
        message: rareReaction.message,
        type: rareReaction.type,
        rareId: rareReaction.id,
        rareTitle: rareReaction.title
      };
    }

    const studyState = inspectStudyInput(inputText);

    if (studyState.ready.length) {
      return {
        message: "ha uma folha pronta para ceder. registra o estudo.",
        type: "success"
      };
    }

    if (studyState.locked.length) {
      return {
        message: "a linha tocou uma costura mais funda, mas o fragmento ainda nao abriu.",
        type: "warn"
      };
    }

    if (result.mode === "memoria de frase" && !result.lockedCount) {
      return {
        message: "o texto reconheceu um eco antigo.",
        type: "success"
      };
    }

    if (result.lockedCount && result.matches.length) {
      return {
        message: "o texto reconhece algo, mas ainda falta peso para a folha abrir.",
        type: "warn"
      };
    }

    if (result.matches.length && !result.lockedCount) {
      return {
        message: "a folha cedeu um pouco, mas nao completamente.",
        type: "success"
      };
    }

    return {
      message: "a margem permaneceu muda.",
      type: "error"
    };
  }

  function isWord(token) {
    return /[\p{L}\p{M}]/u.test(token);
  }

  function tokenize(text) {
    return text.match(TOKEN_RE) || [];
  }

  function sentenceCase(text) {
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
  }

  function matchCase(source, target) {
    if (!target) {
      return target;
    }
    if (source.toUpperCase() === source) {
      return target.toUpperCase();
    }
    if (source[0] && source[0].toUpperCase() === source[0] && source.slice(1).toLowerCase() === source.slice(1)) {
      return sentenceCase(target);
    }
    return target;
  }

  function joinTokens(tokens) {
    let result = "";
    for (const token of tokens) {
      if (!result) {
        result = token;
        continue;
      }
      if (/^[,.;:!?)]$/.test(token)) {
        result += token;
      } else {
        result += " " + token;
      }
    }
    return result;
  }

  function prettifyPortuguese(text) {
    let output = text
      .replace(/\bde o\b/gi, "do")
      .replace(/\bde a\b/gi, "da")
      .replace(/\bem o\b/gi, "no")
      .replace(/\bem a\b/gi, "na")
      .replace(/\bnao\b/gi, "nao");

    if (/^morte\b/i.test(output)) {
      output = output.replace(/^morte\b/i, "a morte");
    }

    return sentenceCase(output);
  }

  function phraseUnlocked(phrase) {
    return phrase.requiredWords.every(isUnlockedWord)
      && phrase.requiredFragments.every(isUnlockedFragment)
      && phrase.requiredPages.every(isUnlockedPage);
  }

  function fragmentRewardLabel(fragment) {
    if (!fragment.words.length) {
      return "memorias exatas";
    }
    if (fragment.words.length === 1) {
      return "1 palavra";
    }
    return fragment.words.length + " palavras";
  }

  function fragmentPageProgress(fragment) {
    const total = fragment.pages.length;
    const unlocked = fragment.pages.filter(function (page) {
      return isUnlockedPage(page.id);
    }).length;
    return {
      unlocked: unlocked,
      total: total
    };
  }

  function manualNoteTotal() {
    return Object.keys(progress.manualNotes).filter(function (pageId) {
      return !!getManualNote(pageId);
    }).length;
  }

  function noteTypeLabel(typeId) {
    return NOTE_TYPE_MAP.has(typeId) ? NOTE_TYPE_MAP.get(typeId).label : "Teoria";
  }

  function availableNotePages() {
    return Array.from(PAGE_BY_ID.values()).filter(function (page) {
      return page.fragmentId !== "base" && isUnlockedPage(page.id);
    }).sort(compareStudyPages);
  }

  function pageDisplayLabel(page) {
    return page.fragmentTitle + " // " + page.folio;
  }

  function formatTimestamp(timestamp) {
    if (!timestamp) {
      return "sem data";
    }
    try {
      return new Date(timestamp).toLocaleString("pt-BR");
    } catch (error) {
      return "sem data";
    }
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function multilineHtml(value) {
    return escapeHtml(value).replace(/\r?\n/g, "<br>");
  }

  function entriesForFragment(fragment) {
    return fragment.words.map(function (wordId) {
      return HAATER_TO_ENTRY.get(wordId);
    }).filter(Boolean);
  }

  function pageEntriesForFragment(page, fragment) {
    const allowed = new Set(fragment.words);
    const seen = new Set();
    const entries = [];
    const tokens = tokenize(page.excerpt || "");

    for (const token of tokens) {
      const entry = HAATER_TO_ENTRY.get(token);
      if (!entry || !allowed.has(entry.id) || seen.has(entry.id)) {
        continue;
      }
      seen.add(entry.id);
      entries.push(entry);
    }

    return entries;
  }

  function examplesForEntry(entry, fragment) {
    return PHRASEBOOK.filter(function (phrase) {
      return phrase.requiredFragments.includes(fragment.id)
        && phrase.requiredWords.includes(entry.id);
    }).slice(0, 2);
  }

  function wordDiscoveryHtml(entry, fragment) {
    const examples = examplesForEntry(entry, fragment);
    const exampleHtml = examples.length
      ? '<div class="word-example"><span>uso</span>' + examples.map(function (example) {
        return '<p>' + escapeHtml(example.haater) + " -> " + escapeHtml(example.pt) + "</p>";
      }).join("") + "</div>"
      : '<div class="word-example muted"><span>uso</span><p>procure esta palavra em novas linhas do ARG.</p></div>';

    return '<article class="word-discovery-card">' +
      '<div class="word-term"><strong>' + escapeHtml(entry.haater) + "</strong><em>" + escapeHtml(entry.pt) + "</em></div>" +
      '<p class="word-clue">' + escapeHtml(entry.gloss) + "</p>" +
      exampleHtml +
      "</article>";
  }

  function wordDiscoveryPanelHtml(fragment) {
    const entries = entriesForFragment(fragment);

    if (!entries.length) {
      return "";
    }

    return '<section class="word-discovery-panel">' +
      '<div class="word-discovery-head">' +
      "<div>" +
      '<span class="discovery-kicker">vocabulario recuperado</span>' +
      "<h4>Palavras que esta tabua ensinou</h4>" +
      "</div>" +
      '<span class="word-count">' + entries.length + " termos</span>" +
      "</div>" +
      '<p class="discovery-note">Compare os termos com os folios abaixo. O Haater nao entrega sentido por definicao pura; ele repete peso, imagem e contexto.</p>' +
      '<div class="word-discovery-grid">' +
      entries.map(function (entry) {
        return wordDiscoveryHtml(entry, fragment);
      }).join("") +
      "</div>" +
      "</section>";
  }

  function folioWordsHtml(page, fragment) {
    const entries = pageEntriesForFragment(page, fragment);

    if (!entries.length) {
      return "";
    }

    return '<div class="folio-words">' +
      '<span class="folio-words-label">palavras desta folha</span>' +
      entries.map(function (entry) {
        return '<span class="folio-word-chip"><strong>' + escapeHtml(entry.haater) + "</strong> = " + escapeHtml(entry.pt) + "</span>";
      }).join("") +
      "</div>";
  }

  function contextStageProgress(stage) {
    const unlocked = stage.words.filter(isUnlockedWord);
    return {
      unlocked: unlocked.length,
      total: stage.words.length,
      complete: unlocked.length >= stage.words.length
    };
  }

  function firstIncompleteContextStageIndex() {
    for (let index = 0; index < CONTEXT_STAGES.length; index += 1) {
      if (!contextStageProgress(CONTEXT_STAGES[index]).complete) {
        return index;
      }
    }
    return -1;
  }

  function uniqueNormalized(values) {
    const seen = new Set();
    const result = [];
    for (const value of values) {
      const normalizedValue = normalize(value);
      if (!normalizedValue || seen.has(normalizedValue)) {
        continue;
      }
      seen.add(normalizedValue);
      result.push(value);
    }
    return result;
  }

  function acceptedAnswersForEntry(entry) {
    return uniqueNormalized([entry.pt].concat(entry.reverse || []));
  }

  function acceptsContextGuess(entry, guess) {
    const normalizedGuess = normalize(guess);
    return acceptedAnswersForEntry(entry).some(function (answer) {
      return normalize(answer) === normalizedGuess;
    });
  }

  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function redactAnswerText(value, entry) {
    let output = value;
    const answers = acceptedAnswersForEntry(entry).sort(function (left, right) {
      return right.length - left.length;
    });

    for (const answer of answers) {
      if (!answer || answer.length < 2) {
        continue;
      }
      output = output.replace(new RegExp("\\b" + escapeRegExp(answer) + "\\b", "gi"), "____");
    }

    return output;
  }

  function contextExamplesForEntry(entry) {
    return PHRASEBOOK.filter(function (phrase) {
      return phrase.requiredWords.includes(entry.id);
    }).slice(0, 2);
  }

  function contextEvidenceHtml(entry) {
    const examples = contextExamplesForEntry(entry);
    if (!examples.length) {
      return '<div class="context-evidence empty-evidence">procure este termo nos proximos rastros do ARG.</div>';
    }

    return examples.map(function (example) {
      return '<div class="context-evidence">' +
        '<code>' + escapeHtml(example.haater) + "</code>" +
        "<p>" + escapeHtml(redactAnswerText(example.pt, entry)) + "</p>" +
        "</div>";
    }).join("");
  }

  function renderContextStagePanel(stage, index, activeIndex) {
    const progressState = contextStageProgress(stage);
    const active = index === activeIndex;
    const locked = activeIndex !== -1 && index > activeIndex;
    const stageCard = document.createElement("article");
    stageCard.className = "context-stage" + (active ? " active" : "") + (progressState.complete ? " complete" : "") + (locked ? " locked" : "");

    const unlockedEntries = stage.words.map(function (wordId) {
      return HAATER_TO_ENTRY.get(wordId);
    }).filter(function (entry) {
      return entry && isUnlockedWord(entry.id);
    });

    stageCard.innerHTML =
      '<div class="context-stage-head">' +
      "<div>" +
      '<span class="context-kicker">etapa ' + (index + 1) + "</span>" +
      "<h3>" + escapeHtml(stage.title) + "</h3>" +
      "</div>" +
      '<span class="context-progress">' + progressState.unlocked + " / " + progressState.total + " palavras</span>" +
      "</div>" +
      "<p>" + escapeHtml(stage.note) + "</p>";

    if (locked) {
      stageCard.innerHTML += '<div class="context-locked-note">A proxima folha de estudo so aparece quando a etapa anterior estiver reconstruida.</div>';
    } else if (progressState.complete) {
      stageCard.innerHTML += '<div class="context-recovered-line">' + unlockedEntries.map(function (entry) {
        return '<span><strong>' + escapeHtml(entry.haater) + "</strong> = " + escapeHtml(entry.pt) + "</span>";
      }).join("") + "</div>";
    } else {
      const wordGrid = document.createElement("div");
      wordGrid.className = "context-word-grid";

      stage.words.forEach(function (wordId) {
        const entry = HAATER_TO_ENTRY.get(wordId);
        if (!entry) {
          return;
        }

        const unlocked = isUnlockedWord(entry.id);
        const wordCard = document.createElement("article");
        wordCard.className = "context-word-card" + (unlocked ? " solved" : "");
        if (unlocked) {
          wordCard.innerHTML =
            '<div class="context-word-top">' +
            "<strong>" + escapeHtml(entry.haater) + "</strong>" +
            "<span>reconstruida</span>" +
            "</div>" +
            '<p class="context-answer">' + escapeHtml(entry.pt) + "</p>" +
            '<p class="context-clue">' + escapeHtml(entry.gloss) + "</p>";
        } else {
          wordCard.innerHTML =
            '<div class="context-word-top">' +
            "<strong>" + escapeHtml(entry.haater) + "</strong>" +
            "<span>termo lacrado</span>" +
            "</div>" +
            '<p class="context-clue"><span>rastro de sentido</span>' + escapeHtml(redactAnswerText(entry.gloss, entry)) + "</p>" +
            contextEvidenceHtml(entry) +
            '<form class="context-word-form" data-word-id="' + escapeHtml(entry.id) + '">' +
            '<input type="text" autocomplete="off" spellcheck="false" placeholder="hipotese em portugues...">' +
            '<button type="submit">Conferir</button>' +
            '<div class="context-word-feedback" aria-live="polite"></div>' +
            "</form>";
        }

        wordGrid.appendChild(wordCard);
      });

      stageCard.appendChild(wordGrid);
    }

    return stageCard;
  }

  function renderContextStudies() {
    contextStudyList.innerHTML = "";
    const activeIndex = firstIncompleteContextStageIndex();

    if (activeIndex === -1) {
      const done = document.createElement("div");
      done.className = "context-complete";
      done.innerHTML =
        "<strong>todas as reconstrucoes de contexto foram concluidas.</strong>" +
        "<p>O lexico novo foi aprendido por comparacao, nao so por chave ritual. Agora o grupo pode testar frases mais longas na Mesa de Traducao.</p>";
      contextStudyList.appendChild(done);
    }

    CONTEXT_STAGES.forEach(function (stage, index) {
      contextStudyList.appendChild(renderContextStagePanel(stage, index, activeIndex));
    });
  }

  function setNoteStatus(message, type) {
    noteStatus.textContent = message;
    noteStatus.className = "note-status";
    if (type) {
      noteStatus.classList.add(type);
    }
  }

  function hasDraftNote(pageId) {
    return !!pageId && Object.prototype.hasOwnProperty.call(noteUiState.drafts, pageId);
  }

  function draftNoteRecordFor(pageId) {
    if (!pageId) {
      return normalizeManualNoteRecord(null);
    }
    return hasDraftNote(pageId)
      ? normalizeManualNoteRecord(noteUiState.drafts[pageId])
      : getManualNoteRecord(pageId);
  }

  function draftNoteFor(pageId) {
    return draftNoteRecordFor(pageId).text;
  }

  function rememberCurrentDraft() {
    const pageId = noteUiState.selectedPageId || noteTarget.value;
    if (!pageId || noteTarget.disabled) {
      return;
    }
    noteUiState.drafts[pageId] = {
      text: noteInput.value,
      type: noteType.value,
      updatedAt: Date.now()
    };
  }

  function clearDraftNote(pageId) {
    if (pageId && hasDraftNote(pageId)) {
      delete noteUiState.drafts[pageId];
    }
  }

  function rareReactionForInput(inputText) {
    const normalizedInput = normalize(inputText);
    if (!normalizedInput) {
      return null;
    }

    for (const reaction of RARE_REACTIONS) {
      const matched = reaction.requireAll
        ? reaction.patterns.every(function (pattern) { return normalizedInput.includes(pattern); })
        : reaction.patterns.some(function (pattern) { return normalizedInput.includes(pattern); });

      if (matched) {
        return reaction;
      }
    }

    const repeatedLines = inputText.split(/\r?\n/).map(normalize).filter(function (item) {
      return item;
    });
    const lineCounts = new Map();
    for (const line of repeatedLines) {
      lineCounts.set(line, (lineCounts.get(line) || 0) + 1);
    }
    const hasDuplicate = Array.from(lineCounts.values()).some(function (count) {
      return count >= 2;
    });
    if (hasDuplicate) {
      return {
        id: "rare-repeat",
        message: "o volume nao gosta de repetir a mesma linha como martelo. ele prefere espera a insistencia cega.",
        type: "warn",
        title: "repeticao rejeitada"
      };
    }

    return null;
  }

  function collectStudyKeys(text) {
    const keys = [];
    const seen = new Set();
    const fullKey = normalize(text);

    if (fullKey && !seen.has(fullKey)) {
      seen.add(fullKey);
      keys.push(fullKey);
    }

    for (const rawLine of text.split(/\r?\n/)) {
      const key = normalize(rawLine);
      if (key && !seen.has(key)) {
        seen.add(key);
        keys.push(key);
      }
    }

    return keys;
  }

  function compareStudyPages(left, right) {
    if (left.fragmentOrder !== right.fragmentOrder) {
      return left.fragmentOrder - right.fragmentOrder;
    }
    return left.order - right.order;
  }

  function inspectStudyInput(text) {
    const ready = new Map();
    const locked = new Map();
    const already = new Map();

    for (const key of collectStudyKeys(text)) {
      const candidates = PAGE_TRIGGER_TO_PAGES.get(key) || [];
      for (const page of candidates) {
        if (!isUnlockedFragment(page.fragmentId)) {
          locked.set(page.id, page);
          continue;
        }
        if (isUnlockedPage(page.id)) {
          already.set(page.id, page);
          continue;
        }
        ready.set(page.id, page);
      }
    }

    return {
      ready: Array.from(ready.values()).sort(compareStudyPages),
      locked: Array.from(locked.values()).sort(compareStudyPages),
      already: Array.from(already.values()).sort(compareStudyPages)
    };
  }

  function syncNoteTargetOptions(preferredPageId, forceSelection) {
    const pages = availableNotePages();
    const currentValue = noteUiState.selectedPageId || noteTarget.value;
    noteTarget.innerHTML = "";

    if (!pages.length) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "Nenhuma folha aberta ainda";
      noteTarget.appendChild(option);
      noteTarget.disabled = true;
      noteInput.disabled = true;
      noteType.disabled = true;
      saveNoteButton.disabled = true;
      clearNoteButton.disabled = true;
      noteInput.value = "";
      noteType.value = "teoria";
      noteCount.textContent = manualNoteTotal() + " notas";
      setNoteStatus("Abra uma folha do manuscrito para comecar a escrever na margem.", "");
      noteUiState.selectedPageId = "";
      return;
    }

    for (const page of pages) {
      const option = document.createElement("option");
      option.value = page.id;
      option.textContent = pageDisplayLabel(page);
      noteTarget.appendChild(option);
    }

    let nextValue = pages[0].id;

    if (forceSelection && pages.some(function (page) { return page.id === preferredPageId; })) {
      nextValue = preferredPageId;
    } else if (pages.some(function (page) { return page.id === currentValue; })) {
      nextValue = currentValue;
    } else if (pages.some(function (page) { return page.id === preferredPageId; }) && !noteUiState.selectedPageId) {
      nextValue = preferredPageId;
    }

    noteTarget.value = nextValue;
    noteTarget.disabled = false;
    noteInput.disabled = false;
    noteType.disabled = false;
    saveNoteButton.disabled = false;
    clearNoteButton.disabled = !getManualNote(nextValue) && !draftNoteFor(nextValue).trim();
    noteCount.textContent = manualNoteTotal() + " notas";
    noteUiState.selectedPageId = nextValue;
  }

  function updateNoteEditor(options) {
    const config = typeof options === "object" && options !== null
      ? options
      : { preferredPageId: options };
    const preferredPageId = config.preferredPageId || "";
    const forceSelection = !!config.forceSelection;
    const quiet = !!config.quiet;

    rememberCurrentDraft();
    syncNoteTargetOptions(preferredPageId, forceSelection);

    if (noteTarget.disabled || !noteTarget.value) {
      return;
    }

    const page = PAGE_BY_ID.get(noteTarget.value);
    const noteRecord = draftNoteRecordFor(noteTarget.value);
    noteInput.value = noteRecord.text;
    noteType.value = normalizeNoteType(noteRecord.type);
    clearNoteButton.disabled = !getManualNote(noteTarget.value) && !noteRecord.text.trim();

    if (!quiet) {
      setNoteStatus(
        noteRecord.text.trim()
          ? "Anotacao carregada para " + pageDisplayLabel(page) + "."
          : "Escreva uma anotacao para " + pageDisplayLabel(page) + ".",
        noteRecord.text.trim() ? "success" : ""
      );
    }
  }

  function saveManualNote() {
    const pageId = noteTarget.value;
    if (!pageId || noteTarget.disabled) {
      setNoteStatus("Ainda nao ha folha aberta para receber anotacao.", "error");
      return;
    }

    const noteValue = noteInput.value.trim();
    if (!noteValue) {
      setNoteStatus("Escreve alguma coisa antes de salvar a margem.", "error");
      return;
    }

    setManualNote(pageId, noteValue, noteType.value);
    noteUiState.drafts[pageId] = {
      text: noteValue,
      type: noteType.value,
      updatedAt: Date.now()
    };
    noteUiState.selectedPageId = pageId;
    clearNoteButton.disabled = false;
    noteCount.textContent = manualNoteTotal() + " notas";
    addHistoryEntry(
      "note",
      noteTypeLabel(noteType.value) + " salva",
      pageDisplayLabel(PAGE_BY_ID.get(pageId)) + " // " + noteValue.slice(0, 96)
    );
    setNoteStatus("Sua anotacao foi presa na margem de " + pageDisplayLabel(PAGE_BY_ID.get(pageId)) + ".", "success");
    renderMarginNotes();
    renderHistory();
  }

  function clearManualNote() {
    const pageId = noteTarget.value;
    if (!pageId || noteTarget.disabled) {
      setNoteStatus("Nenhuma folha esta pronta para apagar anotacoes.", "error");
      return;
    }

    if (!getManualNote(pageId)) {
      setNoteStatus("Essa folha nao tem anotacao manual salva.", "error");
      return;
    }

    setManualNote(pageId, "");
    clearDraftNote(pageId);
    noteInput.value = "";
    noteType.value = "teoria";
    clearNoteButton.disabled = true;
    noteCount.textContent = manualNoteTotal() + " notas";
    addHistoryEntry("note", "margem apagada", pageDisplayLabel(PAGE_BY_ID.get(pageId)));
    setNoteStatus("Sua margem foi apagada em " + pageDisplayLabel(PAGE_BY_ID.get(pageId)) + ".", "warn");
    renderMarginNotes();
    renderHistory();
  }

  function updateStudyButtonState() {
    const hasInput = !!sourceText.value.trim();
    const studyState = inspectStudyInput(sourceText.value);

    studyButton.classList.remove("ready", "locked", "idle");

    if (!hasInput) {
      studyButton.textContent = "Registrar estudo";
      studyButton.classList.add("idle");
      return;
    }

    if (studyState.ready.length) {
      studyButton.textContent = "Abrir folha";
      studyButton.classList.add("ready");
      return;
    }

    if (studyState.locked.length) {
      studyButton.textContent = "Costura fechada";
      studyButton.classList.add("locked");
      return;
    }

    studyButton.textContent = "Registrar estudo";
    studyButton.classList.add("idle");
  }

  function detectLanguageFromText(text) {
    const cleaned = normalize(text);
    const words = tokenize(cleaned).filter(isWord);

    if (!words.length) {
      return { language: "pt", confidence: 0 };
    }

    let haaterScore = 0;
    let ptScore = 0;

    for (const word of words) {
      if (HAATER_WORDS.has(word)) {
        haaterScore += 1.4;
      }
      if (PT_WORDS.has(word)) {
        ptScore += 1.1;
      }
      if (PT_HINTS.has(word)) {
        ptScore += 0.3;
      }
    }

    for (const phrase of PHRASEBOOK) {
      if (cleaned.includes(phrase.haaterKey)) {
        haaterScore += 2.1;
      }
      if (cleaned.includes(phrase.ptKey)) {
        ptScore += 1.9;
      }
    }

    const language = haaterScore >= ptScore ? "haater" : "pt";
    const total = Math.max(1, haaterScore + ptScore);
    const confidence = Math.max(0.2, Math.min(0.99, Math.abs(haaterScore - ptScore) / total + 0.45));
    return { language: language, confidence: confidence };
  }

  function collectMatches(text, source) {
    const found = new Map();

    for (const token of tokenize(text)) {
      if (!isWord(token)) {
        continue;
      }

      const normalizedToken = normalize(token);
      const entry = source === "haater"
        ? HAATER_TO_ENTRY.get(normalizedToken)
        : PT_TO_ENTRY.get(normalizedToken);

      if (entry) {
        found.set(entry.id, entry);
      }
    }

    return Array.from(found.values()).sort(function (left, right) {
      if (isUnlockedWord(left.id) && !isUnlockedWord(right.id)) {
        return -1;
      }
      if (!isUnlockedWord(left.id) && isUnlockedWord(right.id)) {
        return 1;
      }
      return left.haater.localeCompare(right.haater);
    });
  }

  function translateHaaterLine(line) {
    const exact = HAATER_EXACT.get(normalize(line));
    if (exact && phraseUnlocked(exact)) {
      return {
        text: sentenceCase(exact.pt),
        mode: "memoria de frase",
        matches: collectMatches(line, "haater"),
        lockedCount: 0
      };
    }

    let lockedCount = 0;
    const translated = [];

    for (const token of tokenize(line)) {
      if (!isWord(token)) {
        translated.push(token);
        continue;
      }

      const entry = HAATER_TO_ENTRY.get(normalize(token));
      if (!entry) {
        translated.push(token);
        continue;
      }

      if (isUnlockedWord(entry.id)) {
        translated.push(matchCase(token, entry.pt));
      } else {
        translated.push(lockedTokenForEntry(entry));
        lockedCount += 1;
      }
    }

    return {
      text: prettifyPortuguese(joinTokens(translated)),
      mode: lockedCount ? "parcial com lacunas" : "lexico e regras",
      matches: collectMatches(line, "haater"),
      lockedCount: lockedCount
    };
  }

  function translatePortugueseLine(line) {
    const exact = PT_EXACT.get(normalize(line));
    if (exact && phraseUnlocked(exact)) {
      return {
        text: sentenceCase(exact.haater),
        mode: "memoria de frase",
        matches: collectMatches(line, "pt"),
        lockedCount: 0
      };
    }

    let lockedCount = 0;
    const translated = [];

    for (const token of tokenize(line)) {
      if (!isWord(token)) {
        translated.push(token);
        continue;
      }

      const normalizedToken = normalize(token);
      if (ARTICLES_TO_DROP.has(normalizedToken)) {
        continue;
      }

      const entry = PT_TO_ENTRY.get(normalizedToken);
      if (!entry) {
        translated.push(token.toLowerCase());
        continue;
      }

      if (isUnlockedWord(entry.id)) {
        translated.push(matchCase(token, entry.haater));
      } else {
        translated.push(lockedTokenForEntry(entry));
        lockedCount += 1;
      }
    }

    return {
      text: sentenceCase(joinTokens(translated)),
      mode: lockedCount ? "parcial com lacunas" : "lexico e regras",
      matches: collectMatches(line, "pt"),
      lockedCount: lockedCount
    };
  }

  function summarizeModes(results) {
    const unique = Array.from(new Set(results.map(function (item) { return item.mode; }).filter(Boolean)));
    if (!unique.length) {
      return "aguardando";
    }
    if (unique.length === 1) {
      return unique[0];
    }
    return "misto";
  }

  function translateText(text, source, target) {
    if (!text.trim()) {
      return { text: "", mode: "aguardando", matches: [], lockedCount: 0 };
    }

    if (source === target) {
      return {
        text: text,
        mode: "mesmo idioma",
        matches: collectMatches(text, source),
        lockedCount: 0
      };
    }

    const results = text.split(/\r?\n/).map(function (line) {
      if (!line.trim()) {
        return { text: "", mode: "aguardando", matches: [], lockedCount: 0 };
      }
      return source === "haater" ? translateHaaterLine(line) : translatePortugueseLine(line);
    });

    const mergedMatches = new Map();
    let lockedCount = 0;

    for (const result of results) {
      lockedCount += result.lockedCount;
      for (const match of result.matches) {
        mergedMatches.set(match.id, match);
      }
    }

    return {
      text: results.map(function (item) { return item.text; }).join("\n"),
      mode: summarizeModes(results),
      matches: Array.from(mergedMatches.values()),
      lockedCount: lockedCount
    };
  }

  function makeEmpty(message) {
    const node = document.createElement("div");
    node.className = "empty-state";
    node.textContent = message;
    return node;
  }

  function renderMatches(matches) {
    matchesList.innerHTML = "";

    if (!matches.length) {
      matchesList.appendChild(makeEmpty("Nenhum termo reconhecido ainda. Tenta frases curtas ou fragmentos do proprio Solin."));
      return;
    }

    for (const match of matches) {
      const card = document.createElement("article");
      const unlocked = isUnlockedWord(match.id);
      card.className = "chip " + (unlocked ? "unlocked" : "locked");
      card.innerHTML =
        '<span class="chip-status">' + (unlocked ? "desbloqueado" : "bloqueado") + "</span>" +
        "<strong>" + match.haater + "</strong>" +
        "<span>" + (unlocked ? match.gloss : "Termo reconhecido, mas ainda lacrado.") + "</span>";
      matchesList.appendChild(card);
    }
  }

  function renderExamples() {
    exampleList.innerHTML = "";

    for (const example of EXAMPLES) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "example-chip";
      button.textContent = example;
      button.addEventListener("click", function () {
        sourceText.value = example;
        updateTranslation();
        showStudyPanel("mesa");
        if (studyLayout) {
          studyLayout.scrollIntoView({ block: "start", behavior: "smooth" });
        }
      });
      exampleList.appendChild(button);
    }
  }

  function renderFragments() {
    fragmentList.innerHTML = "";

    for (const fragment of FRAGMENTS) {
      const unlocked = isUnlockedFragment(fragment.id);
      const pageProgress = fragmentPageProgress(fragment);
      const discoveredWords = fragment.words.filter(isUnlockedWord);
      const partial = !unlocked && discoveredWords.length > 0;
      const card = document.createElement("article");
      card.className = "fragment-card" + (unlocked ? " unlocked" : "") + (partial ? " partial" : "");

      const title = unlocked || partial ? fragment.title : (fragment.sealedTitle || ("Fragmento Lacrado " + fragment.order));
      const description = unlocked
        ? fragment.hint
        : partial
          ? "A tabua ainda nao abriu inteira, mas algumas palavras ja foram reconstruidas por contexto."
        : (fragment.sealedHint || ("Ainda fechado. " + fragmentRewardLabel(fragment) + " presas aqui."));

      card.innerHTML =
        '<div class="fragment-meta">' +
        "<h3>" + title + "</h3>" +
        '<span class="fragment-state">' + (unlocked ? (pageProgress.unlocked >= pageProgress.total ? "aberto" : "em estudo") : (partial ? "em reconstrucao" : "lacrado")) + "</span>" +
        "</div>" +
        "<p>" + description + "</p>";

      const words = document.createElement("div");
      words.className = "fragment-words";
      if (unlocked) {
        if (fragment.words.length) {
          words.textContent = fragment.words
            .map(function (wordId) {
              const entry = HAATER_TO_ENTRY.get(wordId);
              return entry ? entry.haater + " = " + entry.pt : wordId;
            })
            .join(" | ");
        } else {
          words.textContent = "Memorias exatas desse caderno agora respondem ao tradutor.";
        }
        words.textContent += " // " + pageProgress.unlocked + "/" + pageProgress.total + " folios cedidos";
      } else {
        if (partial) {
          words.textContent = discoveredWords.map(function (wordId) {
            const entry = HAATER_TO_ENTRY.get(wordId);
            return entry ? entry.haater + " = " + entry.pt : wordId;
          }).join(" | ") + " // " + discoveredWords.length + "/" + fragment.words.length + " palavras reconstruidas";
        } else {
          words.textContent = "Frase ritual ou reconstrucao por contexto necessaria. O titulo ainda nao voltou.";
        }
      }

      card.appendChild(words);
      fragmentList.appendChild(card);
    }
  }

  function renderRecoveredLibrary() {
    recoveredLibrary.innerHTML = "";

    const recovered = FRAGMENTS.filter(function (fragment) {
      return fragment.id !== "base" && isUnlockedFragment(fragment.id);
    });

    if (!recovered.length) {
      recoveredLibrary.appendChild(
        makeEmpty("Nenhum fragmento respondeu ainda. O artefato segue incompleto.")
      );
      return;
    }

    for (const fragment of recovered) {
      const card = document.createElement("article");
      card.className = "recovered-card";
      const pageProgress = fragmentPageProgress(fragment);

      const meta = pageProgress.unlocked + " / " + pageProgress.total + " folios cedidos";

      card.innerHTML =
        '<div class="recovered-topline">' +
        "<h3>" + fragment.title + "</h3>" +
        '<span class="recovered-label">' + fragment.libraryLabel + "</span>" +
        "</div>" +
        "<p>" + fragment.libraryNote + "</p>" +
        '<div class="recovered-reward">' + fragment.reward + "</div>" +
        wordDiscoveryPanelHtml(fragment) +
        '<div class="recovered-meta">' + meta + "</div>";

      const folioGrid = document.createElement("div");
      folioGrid.className = "folio-grid";

      for (const page of fragment.pages) {
        const pageCard = document.createElement("article");
        const pageUnlocked = isUnlockedPage(page.id);
        pageCard.className = "folio-card" + (pageUnlocked ? "" : " locked");
        pageCard.innerHTML =
          '<span class="folio-label">' + page.folio + "</span>" +
          "<h4>" + (pageUnlocked ? page.title : "margem selada") + "</h4>" +
          "<p>" + (pageUnlocked ? page.excerpt : "A costura ainda nao cedeu esta folha.") + "</p>" +
          (pageUnlocked ? folioWordsHtml(page, fragment) : "") +
          '<div class="folio-note">' + (pageUnlocked ? "margem anotada disponivel abaixo." : "Registra a leitura certa para abrir este folio.") + "</div>";
        folioGrid.appendChild(pageCard);
      }

      card.appendChild(folioGrid);

      recoveredLibrary.appendChild(card);
    }
  }

  function renderMarginNotes() {
    marginNotes.innerHTML = "";

    const pages = [];
    const filter = noteFilter.value || "todas";

    for (const fragment of FRAGMENTS) {
      if (fragment.id === "base" || !isUnlockedFragment(fragment.id)) {
        continue;
      }
      for (const page of fragment.pages) {
        if (isUnlockedPage(page.id)) {
          pages.push({
            fragment: fragment,
            page: page
          });
        }
      }
    }

    if (!pages.length) {
      marginNotes.appendChild(
        makeEmpty("Nenhuma margem anotada voltou ainda. O estudo segue raso.")
      );
      noteCount.textContent = manualNoteTotal() + " notas";
      return;
    }

    pages.sort(function (left, right) {
      if (left.fragment.order !== right.fragment.order) {
        return left.fragment.order - right.fragment.order;
      }
      return left.page.order - right.page.order;
    });

    const filteredPages = pages.filter(function (entry) {
      const noteRecord = getManualNoteRecord(entry.page.id);
      if (filter === "todas") {
        return true;
      }
      if (filter === "com-notas") {
        return !!noteRecord.text;
      }
      return noteRecord.type === filter && !!noteRecord.text;
    });

    if (!filteredPages.length) {
      marginNotes.appendChild(
        makeEmpty("Nenhuma margem combina com o filtro atual. Tente outro recorte.")
      );
      noteCount.textContent = manualNoteTotal() + " notas";
      return;
    }

    for (const entry of filteredPages) {
      const noteRecord = getManualNoteRecord(entry.page.id);
      const manualNote = noteRecord.text;
      const note = document.createElement("article");
      note.className = "margin-card" + (manualNote ? " has-player-note" : "");
      note.innerHTML =
        '<span class="margin-label">margem anotada</span>' +
        "<h4>" + entry.fragment.title + " // " + entry.page.folio + "</h4>" +
        '<div class="margin-block">' +
        '<span class="margin-block-label">nota do artefato</span>' +
        "<p>" + entry.page.annotation + "</p>" +
        "</div>" +
        '<div class="margin-player' + (manualNote ? "" : " empty") + '">' +
        '<span class="margin-block-label">sua margem' +
        (manualNote ? ' <span class="note-type-chip type-' + noteRecord.type + '">' + noteTypeLabel(noteRecord.type) + "</span>" : "") +
        "</span>" +
        "<p>" + (manualNote || "Nenhuma anotacao manual salva para esta folha ainda.") + "</p>" +
        "</div>";
      marginNotes.appendChild(note);
    }

    noteCount.textContent = manualNoteTotal() + " notas";
  }

  function renderHistory() {
    historyList.innerHTML = "";

    const entries = progress.historyEntries.slice().sort(function (left, right) {
      return right.timestamp - left.timestamp;
    });

    if (!entries.length) {
      historyList.appendChild(
        makeEmpty("Nenhum registro foi preso no historico ainda. O volume segue quieto.")
      );
      return;
    }

    for (const entry of entries) {
      const meta = historyMetaForKind(entry.kind);
      const item = document.createElement("article");
      item.className = "history-card kind-" + meta.tone;
      item.innerHTML =
        '<div class="history-topline">' +
        '<div class="history-event">' +
        '<span class="history-mark kind-' + meta.tone + '">' + meta.mark + "</span>" +
        '<span class="history-kind">' + meta.label + "</span>" +
        "</div>" +
        '<span class="history-time">' + formatTimestamp(entry.timestamp) + "</span>" +
        "</div>" +
        "<h4>" + entry.title + "</h4>" +
        "<p>" + (entry.detail || "sem detalhe") + "</p>";
      historyList.appendChild(item);
    }
  }

  function renderSecretArchive() {
    secretArchive.innerHTML = "";

    const unlockedSecrets = SECRET_TEXTS.filter(function (secret) {
      return isUnlockedSecret(secret.id);
    }).sort(function (left, right) {
      return left.order - right.order;
    });

    secretCount.textContent = unlockedSecrets.length + " restos";

    if (!unlockedSecrets.length) {
      secretArchive.appendChild(
        makeEmpty("Nenhum resto velado cedeu ainda. Algumas linhas raras deixam mais do que traducao.")
      );
      return;
    }

    for (const secret of unlockedSecrets) {
      const card = document.createElement("article");
      card.className = "secret-card";
      card.innerHTML =
        '<div class="secret-topline">' +
        '<span class="secret-label">' + secret.label + "</span>" +
        '<span class="secret-state">resto preservado</span>' +
        "</div>" +
        "<h3>" + secret.title + "</h3>" +
        '<div class="secret-block">' +
        '<span class="secret-block-label">haater antigo</span>' +
        "<p>" + secret.haater + "</p>" +
        "</div>" +
        '<div class="secret-block translation">' +
        '<span class="secret-block-label">traducao arriscada</span>' +
        "<p>" + secret.portuguese + "</p>" +
        "</div>" +
        '<div class="secret-note">' +
        '<span class="secret-block-label">nota solta</span>' +
        "<p>" + secret.note + "</p>" +
        "</div>";
      secretArchive.appendChild(card);
    }
  }

  function renderProgress() {
    progressWords.textContent = progress.unlockedWordIds.size + " / " + LEXICON.length;
    progressFragments.textContent = progress.unlockedFragmentIds.size + " / " + FRAGMENTS.length;
    progressPages.textContent = progress.unlockedPageIds.size + " / " + TOTAL_PAGE_COUNT;
    renderFragments();
    renderContextStudies();
    renderRecoveredLibrary();
    renderMarginNotes();
    renderHistory();
    renderSecretArchive();
    updateNoteEditor({
      preferredPageId: noteUiState.selectedPageId || noteTarget.value,
      quiet: true
    });
  }

  function currentDirection() {
    const detected = detectLanguageFromText(sourceText.value);
    const source = sourceLanguage.value === "auto" ? detected.language : sourceLanguage.value;

    if (targetLanguage.value === source) {
      targetLanguage.value = source === "haater" ? "pt" : "haater";
    }

    return {
      source: source,
      target: targetLanguage.value,
      detected: detected
    };
  }

  function updateTranslation() {
    const direction = currentDirection();
    const result = translateText(sourceText.value, direction.source, direction.target);
    const artifactState = describeArtifactState(result, sourceText.value);
    const studyState = inspectStudyInput(sourceText.value);
    const preferredPage = (studyState.ready[0] || studyState.already[0] || studyState.locked[0] || {}).id;

    targetText.value = result.text;
    detectedLanguage.textContent = direction.source === "haater" ? "Haater Antigo" : "Portugues";
    confidenceValue.textContent = Math.round(direction.detected.confidence * 100) + "%";
    translationMode.textContent = result.lockedCount ? result.mode + " (" + result.lockedCount + " lacunas)" : result.mode;
    renderMatches(result.matches);
    setArtifactMessage(artifactState.message, artifactState.type);
    if (artifactState.rareId) {
      if (sessionState.lastRareReactionId !== artifactState.rareId) {
        addHistoryEntry("reaction", artifactState.rareTitle || "reacao rara", artifactState.message);
      }
      const secret = SECRET_BY_REACTION_ID.get(artifactState.rareId);
      if (secret && unlockSecret(secret.id)) {
        addHistoryEntry("secret", secret.label, secret.title + ". " + secret.note);
        setUnlockMessage("o fragmento respondeu debaixo da costura. Um resto velado entrou na Camara Velada.", "success");
        renderSecretArchive();
        renderHistory();
      }
      sessionState.lastRareReactionId = artifactState.rareId;
    } else {
      sessionState.lastRareReactionId = "";
    }
    updateStudyButtonState();
    if (preferredPage && isUnlockedPage(preferredPage)) {
      updateNoteEditor({
        preferredPageId: preferredPage,
        quiet: true
      });
    }
  }

  function updateAll() {
    renderProgress();
    updateTranslation();
  }

  function openHelpModal() {
    helpModal.classList.add("open");
    helpModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("help-open");
  }

  function showStudyPanel(panelId) {
    const targetId = panelId || "guia";

    for (const panel of studyPanels) {
      panel.classList.toggle("active", panel.getAttribute("data-study-panel") === targetId);
    }

    for (const button of studyNavButtons) {
      const active = button.getAttribute("data-study-target") === targetId;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    }
  }

  function closeHelpModal() {
    helpModal.classList.remove("open");
    helpModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("help-open");
  }

  function insertSafeGuideExample() {
    sourceText.value = "Kael en drath.";
    updateTranslation();
    showStudyPanel("mesa");
    setArtifactMessage("linha segura presa na mesa. observe as palavras que voltam.", "success");
    sourceText.focus();
  }

  function showNextLostHint() {
    const hint = LOST_HINTS[sessionState.lostHintIndex % LOST_HINTS.length];
    lostHint.textContent = hint;
    lostHint.classList.add("active");
    sessionState.lostHintIndex += 1;
  }

  function handleContextStudySubmit(event) {
    const form = event.target.closest(".context-word-form");
    if (!form) {
      return;
    }

    event.preventDefault();
    const wordId = form.getAttribute("data-word-id");
    const entry = HAATER_TO_ENTRY.get(wordId);
    const input = form.querySelector("input");
    const feedback = form.querySelector(".context-word-feedback");
    const guess = input ? input.value.trim() : "";

    if (!entry || !guess) {
      if (feedback) {
        feedback.textContent = "a margem precisa de uma hipotese.";
        feedback.className = "context-word-feedback error";
      }
      setArtifactMessage("a reconstrucao ficou sem peso.", "error");
      return;
    }

    if (!acceptsContextGuess(entry, guess)) {
      if (feedback) {
        feedback.textContent = "essa hipotese nao encaixou no rastro.";
        feedback.className = "context-word-feedback error";
      }
      setArtifactMessage("a folha recusou essa traducao.", "warn");
      return;
    }

    const fragment = FRAGMENT_BY_ID.get(entry.fragment);
    const fragmentWasUnlocked = fragment ? isUnlockedFragment(fragment.id) : false;
    unlockWordByContext(entry);
    setUnlockMessage("palavra reconstruida por contexto: " + entry.haater + " = " + entry.pt + ".", "success");
    setArtifactMessage("a traducao veio por repeticao, nao por chave.", "success");

    if (fragment && !fragmentWasUnlocked && isUnlockedFragment(fragment.id)) {
      setUnlockMessage("a tabua foi reconstruida por contexto: " + fragment.title + ". Primeira folha recuperada.", "success");
      setArtifactMessage("a costura abriu sem frase-chave.", "success");
    } else if (fragment && !isUnlockedFragment(fragment.id)) {
      const remaining = fragment.words.filter(function (word) {
        return !isUnlockedWord(word);
      }).length;
      if (remaining > 0) {
        setArtifactMessage("a tabua ainda segura " + remaining + " palavra" + (remaining === 1 ? "" : "s") + ".", "warn");
      }
    }

    updateAll();
  }

  function openVolume() {
    if (document.body.classList.contains("volume-open") || document.body.classList.contains("opening-volume")) {
      return;
    }
    document.body.classList.add("opening-volume");
    window.setTimeout(function () {
      document.body.classList.add("volume-open");
      document.body.classList.remove("opening-volume");
      workspace.classList.remove("shell-hidden");
      sourceText.focus();
    }, 900);
  }

  function exportNotebook() {
    const recovered = FRAGMENTS.filter(function (fragment) {
      return fragment.id !== "base" && isUnlockedFragment(fragment.id);
    });
    const unlockedSecrets = SECRET_TEXTS.filter(function (secret) {
      return isUnlockedSecret(secret.id);
    }).sort(function (left, right) {
      return left.order - right.order;
    });

    const exportedAt = formatTimestamp(Date.now());
    const historyEntries = progress.historyEntries.slice().sort(function (left, right) {
      return right.timestamp - left.timestamp;
    });
    const html = [
      "<!DOCTYPE html>",
      '<html lang="pt-BR">',
      "<head>",
      '<meta charset="utf-8">',
      '<meta name="viewport" content="width=device-width, initial-scale=1">',
      "<title>Dossie de Estudo Haater</title>",
      "<style>",
      "  :root {",
      "    --bg: #201711;",
      "    --paper: #efe2c4;",
      "    --paper-strong: #e5d0a7;",
      "    --paper-soft: #f7edd7;",
      "    --ink: #34251a;",
      "    --ink-soft: #6d5135;",
      "    --line: rgba(92, 67, 41, 0.18);",
      "    --accent: #7b5a35;",
      "    --accent-soft: rgba(123, 90, 53, 0.14);",
      "    --shadow: 0 24px 80px rgba(0, 0, 0, 0.24);",
      "  }",
      "  * { box-sizing: border-box; }",
      "  html, body { margin: 0; padding: 0; }",
      "  body {",
      "    min-height: 100vh;",
      "    background:",
      "      radial-gradient(circle at top, rgba(255, 224, 163, 0.08), transparent 32%),",
      "      linear-gradient(180deg, #2b1f17 0%, #1b1410 100%);",
      "    color: var(--ink);",
      "    font-family: Georgia, 'Palatino Linotype', 'Book Antiqua', serif;",
      "    padding: 40px 18px 56px;",
      "  }",
      "  .sheet {",
      "    max-width: 1080px;",
      "    margin: 0 auto;",
      "    background:",
      "      linear-gradient(180deg, rgba(255,255,255,0.1), rgba(255,255,255,0)),",
      "      repeating-linear-gradient(180deg, rgba(118, 92, 58, 0.06) 0, rgba(118, 92, 58, 0.06) 1px, transparent 1px, transparent 26px),",
      "      linear-gradient(180deg, var(--paper-soft), var(--paper));",
      "    border: 1px solid rgba(91, 66, 39, 0.18);",
      "    border-radius: 32px;",
      "    box-shadow: var(--shadow);",
      "    overflow: hidden;",
      "  }",
      "  .hero {",
      "    position: relative;",
      "    padding: 40px 38px 34px;",
      "    background:",
      "      radial-gradient(circle at top right, rgba(128, 92, 54, 0.16), transparent 36%),",
      "      linear-gradient(180deg, rgba(120, 84, 48, 0.22), rgba(120, 84, 48, 0.08));",
      "    border-bottom: 1px solid var(--line);",
      "  }",
      "  .hero::after {",
      "    content: '';",
      "    position: absolute;",
      "    inset: auto 38px 0 38px;",
      "    height: 1px;",
      "    background: linear-gradient(90deg, transparent, rgba(91, 66, 39, 0.36), transparent);",
      "  }",
      "  .eyebrow {",
      "    display: inline-block;",
      "    text-transform: uppercase;",
      "    letter-spacing: 0.2em;",
      "    font-size: 0.74rem;",
      "    color: var(--ink-soft);",
      "  }",
      "  h1 {",
      "    margin: 16px 0 10px;",
      "    font-size: clamp(2rem, 5vw, 3.4rem);",
      "    line-height: 1.02;",
      "    color: var(--ink);",
      "  }",
      "  .hero p {",
      "    margin: 0;",
      "    max-width: 760px;",
      "    color: var(--ink-soft);",
      "    line-height: 1.7;",
      "    font-size: 1.02rem;",
      "  }",
      "  .hero-top {",
      "    display: flex;",
      "    align-items: start;",
      "    justify-content: space-between;",
      "    gap: 18px;",
      "    flex-wrap: wrap;",
      "  }",
      "  .print-button {",
      "    appearance: none;",
      "    border: 1px solid rgba(91, 66, 39, 0.22);",
      "    background: rgba(255, 246, 225, 0.82);",
      "    color: var(--ink);",
      "    border-radius: 999px;",
      "    padding: 12px 18px;",
      "    font: inherit;",
      "    cursor: pointer;",
      "    box-shadow: 0 10px 30px rgba(70, 49, 30, 0.08);",
      "  }",
      "  .print-button:hover { background: rgba(255, 250, 238, 0.95); }",
      "  .hero-meta {",
      "    display: grid;",
      "    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));",
      "    gap: 14px;",
      "    margin-top: 24px;",
      "  }",
      "  .meta-card {",
      "    padding: 16px 18px;",
      "    border-radius: 18px;",
      "    border: 1px solid var(--line);",
      "    background: rgba(255, 249, 235, 0.72);",
      "  }",
      "  .meta-card span {",
      "    display: block;",
      "    text-transform: uppercase;",
      "    letter-spacing: 0.12em;",
      "    font-size: 0.72rem;",
      "    color: var(--ink-soft);",
      "  }",
      "  .meta-card strong {",
      "    display: block;",
      "    margin-top: 8px;",
      "    font-size: 1.2rem;",
      "    color: var(--ink);",
      "  }",
      "  .content { padding: 30px 26px 34px; }",
      "  .section { margin-top: 22px; }",
      "  .section:first-child { margin-top: 0; }",
      "  .section-head {",
      "    display: flex;",
      "    justify-content: space-between;",
      "    gap: 18px;",
      "    align-items: baseline;",
      "    flex-wrap: wrap;",
      "    margin-bottom: 14px;",
      "  }",
      "  .section-head h2 {",
      "    margin: 0;",
      "    font-size: 1.55rem;",
      "    color: var(--ink);",
      "  }",
      "  .section-head p {",
      "    margin: 0;",
      "    color: var(--ink-soft);",
      "    line-height: 1.65;",
      "    max-width: 520px;",
      "  }",
      "  .stack { display: grid; gap: 16px; }",
      "  .card {",
      "    border-radius: 22px;",
      "    border: 1px solid var(--line);",
      "    background: rgba(255, 249, 236, 0.78);",
      "    padding: 18px 20px;",
      "  }",
      "  .card-top {",
      "    display: flex;",
      "    justify-content: space-between;",
      "    gap: 12px;",
      "    flex-wrap: wrap;",
      "    align-items: baseline;",
      "  }",
      "  .card-kicker, .pill, .event-mark, .note-chip, .block-label {",
      "    display: inline-flex;",
      "    align-items: center;",
      "    justify-content: center;",
      "    text-transform: uppercase;",
      "    letter-spacing: 0.14em;",
      "    font-size: 0.7rem;",
      "  }",
      "  .card-kicker { color: var(--ink-soft); }",
      "  .pill, .event-mark, .note-chip {",
      "    padding: 7px 10px;",
      "    border-radius: 999px;",
      "    border: 1px solid rgba(91, 66, 39, 0.16);",
      "    background: rgba(255, 245, 221, 0.88);",
      "    color: var(--ink);",
      "  }",
      "  .card h3, .card h4 { margin: 10px 0 0; color: var(--ink); }",
      "  .card p { margin: 12px 0 0; color: var(--ink-soft); line-height: 1.7; }",
      "  .page-grid, .secret-grid, .history-grid, .word-discovery-grid { display: grid; gap: 14px; margin-top: 16px; }",
      "  .page-grid { grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }",
      "  .secret-grid { grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }",
      "  .word-discovery-grid { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }",
      "  .page-card, .secret-card, .history-card, .word-discovery-card {",
      "    border-radius: 18px;",
      "    border: 1px solid var(--line);",
      "    background: rgba(246, 237, 216, 0.72);",
      "    padding: 16px 16px 15px;",
      "  }",
      "  .page-card h4, .secret-card h4, .history-card h4 { font-size: 1rem; }",
      "  .page-card p, .secret-card p, .history-card p { font-size: 0.98rem; }",
      "  .word-discovery-panel { margin-top: 16px; padding: 16px; border-radius: 20px; border: 1px solid var(--line); background: rgba(255, 249, 236, 0.5); }",
      "  .word-discovery-head { display: flex; justify-content: space-between; gap: 12px; }",
      "  .word-discovery-head h4 { margin: 4px 0 0; }",
      "  .discovery-kicker, .word-count, .folio-words-label, .word-example span { color: var(--ink-soft); text-transform: uppercase; letter-spacing: 0.12em; font-size: 0.74rem; }",
      "  .word-count { padding: 6px 9px; border-radius: 999px; border: 1px solid var(--line); }",
      "  .discovery-note, .word-clue { color: var(--ink-soft); }",
      "  .word-term { display: flex; justify-content: space-between; gap: 10px; }",
      "  .word-term strong { color: var(--ink); letter-spacing: 0.04em; }",
      "  .word-term em { color: #4f5c44; font-style: normal; text-align: right; }",
      "  .word-example { margin-top: 10px; padding-top: 9px; border-top: 1px solid rgba(91, 66, 39, 0.12); }",
      "  .word-example p { margin: 5px 0 0; color: var(--ink); font-size: 0.9rem; }",
      "  .folio-words { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 12px; padding-top: 10px; border-top: 1px solid rgba(91, 66, 39, 0.12); }",
      "  .folio-words-label { flex-basis: 100%; }",
      "  .folio-word-chip { padding: 6px 8px; border-radius: 999px; border: 1px solid var(--line); background: rgba(255, 249, 236, 0.58); color: var(--ink-soft); font-size: 0.86rem; }",
      "  .folio-word-chip strong { color: var(--ink); }",
      "  .block {",
      "    margin-top: 12px;",
      "    padding-top: 12px;",
      "    border-top: 1px solid rgba(91, 66, 39, 0.12);",
      "  }",
      "  .block-label { color: var(--ink-soft); }",
      "  .note-chip.teoria { background: rgba(228, 220, 196, 0.88); }",
      "  .note-chip.traducao { background: rgba(218, 226, 202, 0.88); }",
      "  .note-chip.suspeita { background: rgba(233, 214, 191, 0.9); }",
      "  .note-chip.pista { background: rgba(222, 208, 178, 0.9); }",
      "  .history-grid { grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }",
      "  .history-row { display: flex; gap: 12px; align-items: flex-start; }",
      "  .event-mark { min-width: 42px; height: 42px; font-weight: 700; }",
      "  .event-mark.fragment { background: rgba(130, 96, 58, 0.2); }",
      "  .event-mark.word { background: rgba(91, 111, 74, 0.24); }",
      "  .event-mark.folio { background: rgba(113, 99, 61, 0.24); }",
      "  .event-mark.note { background: rgba(126, 109, 81, 0.22); }",
      "  .event-mark.export { background: rgba(154, 120, 69, 0.24); }",
      "  .event-mark.reaction { background: rgba(110, 86, 50, 0.28); }",
      "  .event-mark.secret { background: rgba(74, 56, 40, 0.42); color: #f8edd6; }",
      "  .event-mark.reset { background: rgba(102, 85, 62, 0.22); }",
      "  .muted { color: var(--ink-soft); }",
      "  .empty {",
      "    padding: 18px 20px;",
      "    border-radius: 18px;",
      "    border: 1px dashed rgba(91, 66, 39, 0.22);",
      "    background: rgba(255, 249, 236, 0.5);",
      "    color: var(--ink-soft);",
      "  }",
      "  @media print {",
      "    body { padding: 0; background: #fff; }",
      "    .sheet { box-shadow: none; border-radius: 0; border: none; }",
      "    .print-button { display: none; }",
      "    .section, .card, .page-card, .secret-card, .history-card, .word-discovery-card { break-inside: avoid; }",
      "  }",
      "  @media (max-width: 720px) {",
      "    .hero { padding: 28px 22px 26px; }",
      "    .content { padding: 22px 18px 28px; }",
      "    .page-grid, .secret-grid, .history-grid, .word-discovery-grid { grid-template-columns: 1fr; }",
      "  }",
      "</style>",
      "</head>",
      "<body>",
      '<main class="sheet">',
      '  <header class="hero">',
      '    <div class="hero-top">',
      '      <div>',
      '        <span class="eyebrow">arquivo recuperado // haater antigo</span>',
      '        <h1>Dossie de Estudo Haater</h1>',
      "        <p>Registro exportado do manuscrito de estudo. Biblioteca recuperada, margens anotadas, restos velados e rastros do volume reunidos num unico arquivo apresentavel.</p>",
      "      </div>",
      '      <button class="print-button" type="button" onclick="window.print()">Salvar em PDF / Imprimir</button>',
      "    </div>",
      '    <div class="hero-meta">',
      '      <div class="meta-card"><span>gerado em</span><strong>' + escapeHtml(exportedAt) + "</strong></div>",
      '      <div class="meta-card"><span>palavras liberadas</span><strong>' + progress.unlockedWordIds.size + " / " + LEXICON.length + "</strong></div>",
      '      <div class="meta-card"><span>fragmentos abertos</span><strong>' + progress.unlockedFragmentIds.size + " / " + FRAGMENTS.length + "</strong></div>",
      '      <div class="meta-card"><span>folios abertos</span><strong>' + progress.unlockedPageIds.size + " / " + TOTAL_PAGE_COUNT + "</strong></div>",
      "    </div>",
      "  </header>",
      '  <div class="content">'
    ];

    html.push(
      '<section class="section">',
      '  <div class="section-head">',
      "    <div><h2>Biblioteca Recuperada</h2></div>",
      "    <p>Folhas que ja responderam, com notas do artefato e margens salvas pelo grupo.</p>",
      "  </div>"
    );

    if (!recovered.length) {
      html.push('<div class="empty">Nenhum fragmento aberto ainda.</div>');
    } else {
      html.push('<div class="stack">');
      for (const fragment of recovered) {
        const pageProgress = fragmentPageProgress(fragment);
        html.push(
          '<article class="card">',
          '  <div class="card-top">',
          '    <div><span class="card-kicker">' + escapeHtml(fragment.libraryLabel) + "</span><h3>" + escapeHtml(fragment.title) + "</h3></div>",
          '    <span class="pill">' + pageProgress.unlocked + " / " + pageProgress.total + " folios</span>",
          "  </div>",
          "  <p>" + escapeHtml(fragment.libraryNote) + "</p>",
          wordDiscoveryPanelHtml(fragment),
          '  <div class="page-grid">'
        );

        for (const page of fragment.pages) {
          if (!isUnlockedPage(page.id)) {
            continue;
          }

          const noteRecord = getManualNoteRecord(page.id);
          html.push(
            '<article class="page-card">',
            '  <div class="card-top">',
            '    <div><span class="card-kicker">' + escapeHtml(page.folio) + "</span><h4>" + escapeHtml(page.title) + "</h4></div>",
            '    <span class="pill">' + escapeHtml(fragment.title) + "</span>",
            "  </div>",
            '  <div class="block"><span class="block-label">excerto</span><p>' + multilineHtml(page.excerpt) + "</p></div>",
            '  <div class="block"><span class="block-label">nota do artefato</span><p>' + multilineHtml(page.annotation) + "</p></div>",
            folioWordsHtml(page, fragment)
          );

          if (noteRecord.text) {
            html.push(
              '  <div class="block"><span class="block-label">margem do leitor</span> <span class="note-chip ' + escapeHtml(noteRecord.type) + '">' + escapeHtml(noteTypeLabel(noteRecord.type)) + "</span><p>" + multilineHtml(noteRecord.text) + "</p></div>"
            );
          }

          html.push("</article>");
        }

        html.push("  </div>", "</article>");
      }
      html.push("</div>");
    }

    html.push("</section>");

    html.push(
      '<section class="section">',
      '  <div class="section-head">',
      "    <div><h2>Camara Velada</h2></div>",
      "    <p>Textos extras que o volume so soltou quando certas linhas raras tocaram fundo o bastante.</p>",
      "  </div>"
    );

    if (!unlockedSecrets.length) {
      html.push('<div class="empty">Nenhum resto velado respondeu ainda.</div>');
    } else {
      html.push('<div class="secret-grid">');
      for (const secret of unlockedSecrets) {
        html.push(
          '<article class="secret-card">',
          '  <div class="card-top">',
          '    <div><span class="card-kicker">' + escapeHtml(secret.label) + "</span><h4>" + escapeHtml(secret.title) + "</h4></div>",
          '    <span class="pill">resto preservado</span>',
          "  </div>",
          '  <div class="block"><span class="block-label">haater antigo</span><p>' + multilineHtml(secret.haater) + "</p></div>",
          '  <div class="block"><span class="block-label">traducao arriscada</span><p>' + multilineHtml(secret.portuguese) + "</p></div>",
          '  <div class="block"><span class="block-label">nota solta</span><p>' + multilineHtml(secret.note) + "</p></div>",
          "</article>"
        );
      }
      html.push("</div>");
    }

    html.push("</section>");

    html.push(
      '<section class="section">',
      '  <div class="section-head">',
      "    <div><h2>Historico do Estudo</h2></div>",
      "    <p>Sequencia dos rastros presos pelo volume durante o estudo do grupo.</p>",
      "  </div>"
    );

    if (!historyEntries.length) {
      html.push('<div class="empty">Nenhum registro salvo ainda.</div>');
    } else {
      html.push('<div class="history-grid">');
      for (const entry of historyEntries) {
        const meta = historyMetaForKind(entry.kind);
        html.push(
          '<article class="history-card">',
          '  <div class="history-row">',
          '    <span class="event-mark ' + escapeHtml(meta.tone) + '">' + escapeHtml(meta.mark) + "</span>",
          "    <div>",
          '      <span class="card-kicker">' + escapeHtml(meta.label) + " // " + escapeHtml(formatTimestamp(entry.timestamp)) + "</span>",
          "      <h4>" + escapeHtml(entry.title) + "</h4>",
          "      <p>" + multilineHtml(entry.detail || "sem detalhe") + "</p>",
          "    </div>",
          "  </div>",
          "</article>"
        );
      }
      html.push("</div>");
    }

    html.push("  </div>", "</main>", "</body>", "</html>");

    const blob = new Blob([html.join("\n")], { type: "text/html;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "dossie_estudo_haater_" + new Date().toISOString().slice(0, 10) + ".html";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    addHistoryEntry("export", "dossie exportado", "Biblioteca, margens, textos velados e historico foram reunidos num arquivo HTML.");
    setNoteStatus("O dossie foi exportado como um arquivo HTML bonito para abrir no navegador.", "success");
    renderHistory();
  }

  function studyCurrentText() {
    if (!sourceText.value.trim()) {
      setUnlockMessage("Nenhuma leitura foi registrada ainda.", "error");
      setArtifactMessage("a margem nao recebeu linha suficiente.", "error");
      return;
    }

    const studyState = inspectStudyInput(sourceText.value);

    if (studyState.ready.length) {
      const page = studyState.ready[0];
      const fragment = FRAGMENT_BY_ID.get(page.fragmentId);
      unlockPage(page.id);
      addHistoryEntry("folio", fragment.title + " // " + page.folio, page.title);
      setUnlockMessage(
        "uma nova folha cedeu. " + fragment.title + " // " + page.folio + ".",
        "success"
      );
      setArtifactMessage("a margem abriu " + page.folio + ".", "success");
      updateAll();
      updateNoteEditor({
        preferredPageId: page.id,
        forceSelection: true
      });
      noteInput.focus();
      return;
    }

    if (studyState.locked.length) {
      setUnlockMessage("A leitura bateu numa costura fechada. O fragmento correto ainda precisa responder.", "error");
      setArtifactMessage("a folha reconheceu a linha, mas segurou o corte.", "warn");
      return;
    }

    if (studyState.already.length) {
      setUnlockMessage("Essa folha ja tinha sido registrada antes.", "error");
      setArtifactMessage("essa margem ja tinha voltado.", "warn");
      return;
    }

    setUnlockMessage("Essa leitura nao tocou nenhum folio escondido.", "error");
    setArtifactMessage("a margem permaneceu muda.", "error");
  }

  async function tryUnlockFromInput() {
    const rawCode = unlockCode.value;
    const codeKey = normalizeCode(rawCode);

    if (!codeKey) {
      setUnlockMessage("Digita uma frase ritual ou um codigo primeiro.", "error");
      setArtifactMessage("a lombada nao ouviu nada suficiente.", "error");
      return;
    }

    if (!window.crypto || !window.crypto.subtle) {
      setUnlockMessage("Esse navegador nao suporta o modo seguro de desbloqueio.", "error");
      setArtifactMessage("o artefato nao conseguiu pesar a frase.", "error");
      return;
    }

    const codeHash = await sha256Hex(codeKey);

    const fragment = FRAGMENTS.find(function (item) {
      return Array.isArray(item.unlockHashes) && item.unlockHashes.includes(codeHash);
    });

    if (!fragment) {
      setUnlockMessage("Essa frase nao responde a nenhuma costura conhecida.", "error");
      setArtifactMessage("a palavra veio cedo demais.", "warn");
      return;
    }

    if (isUnlockedFragment(fragment.id)) {
      setUnlockMessage("Esse fragmento ja foi aberto antes.", "error");
      setArtifactMessage("esse eco ja tinha voltado.", "warn");
      return;
    }

    unlockFragment(fragment);
    const recoveredWords = entriesForFragment(fragment);
    const wordPreview = recoveredWords.slice(0, 6).map(function (entry) {
      return entry.haater + "=" + entry.pt;
    }).join(", ");
    const wordDetail = recoveredWords.length
      ? fragment.reward + " Palavras recuperadas: " + wordPreview + (recoveredWords.length > 6 ? "..." : "") + "."
      : fragment.reward;
    addHistoryEntry("fragment", fragment.title, wordDetail);
    unlockCode.value = "";
    const firstFolio = fragment.pages.length ? fragment.pages[0].folio : "folio I";
    const response = fragment.response || {};
    const wordCountText = recoveredWords.length ? " " + recoveredWords.length + " palavras novas entraram na Biblioteca Recuperada." : "";
    const unlockResponse = response.unlock
      ? response.unlock.replace("{folio}", firstFolio) + wordCountText
      : "o fragmento respondeu. " + fragment.reward + " Primeira folha: " + firstFolio + "." + wordCountText;
    setUnlockMessage(
      unlockResponse,
      "success"
    );
    setArtifactMessage(response.artifact || "o fragmento respondeu.", "success");
    updateAll();
    updateNoteEditor({
      preferredPageId: fragment.pages.length ? fragment.pages[0].id : "",
      forceSelection: true
    });
  }

  function swapLanguages() {
    const direction = currentDirection();
    const nextInput = targetText.value || sourceText.value;
    sourceLanguage.value = direction.target;
    targetLanguage.value = direction.source;
    sourceText.value = nextInput;
    updateTranslation();
  }

  function clearAll() {
    sourceText.value = "";
    targetText.value = "";
    detectedLanguage.textContent = "-";
    confidenceValue.textContent = "-";
    translationMode.textContent = "aguardando";
    renderMatches([]);
    setArtifactMessage("o volume espera fechado.", "");
  }

  function copyTranslation() {
    if (!targetText.value.trim()) {
      return;
    }

    navigator.clipboard.writeText(targetText.value).then(function () {
      copyButton.textContent = "Copiado";
      window.setTimeout(function () {
        copyButton.textContent = "Copiar traducao";
      }, 1400);
    });
  }

  sourceText.addEventListener("input", updateTranslation);
  sourceText.addEventListener("keydown", function (event) {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      studyCurrentText();
    }
  });
  sourceLanguage.addEventListener("change", updateTranslation);
  targetLanguage.addEventListener("change", updateTranslation);
  insertGuideExample.addEventListener("click", insertSafeGuideExample);
  lostButton.addEventListener("click", showNextLostHint);
  helpButton.addEventListener("click", openHelpModal);
  helpBackdrop.addEventListener("click", closeHelpModal);
  helpCloseButton.addEventListener("click", closeHelpModal);
  studyNavButtons.forEach(function (button) {
    button.setAttribute("aria-pressed", button.classList.contains("active") ? "true" : "false");
    button.addEventListener("click", function () {
      showStudyPanel(button.getAttribute("data-study-target"));
      if (studyLayout) {
        studyLayout.scrollIntoView({ block: "start", behavior: "smooth" });
      }
    });
  });
  openVolumeButton.addEventListener("click", openVolume);
  swapButton.addEventListener("click", swapLanguages);
  clearButton.addEventListener("click", clearAll);
  copyButton.addEventListener("click", copyTranslation);
  studyButton.addEventListener("click", studyCurrentText);
  noteTarget.addEventListener("change", function () {
    updateNoteEditor({
      preferredPageId: noteTarget.value,
      forceSelection: true
    });
  });
  noteType.addEventListener("change", function () {
    if (!noteTarget.disabled && noteTarget.value) {
      noteUiState.drafts[noteTarget.value] = {
        text: noteInput.value,
        type: noteType.value,
        updatedAt: Date.now()
      };
      setNoteStatus("Tipo de anotacao ajustado para " + noteTypeLabel(noteType.value) + ".", "warn");
    }
  });
  noteFilter.addEventListener("change", renderMarginNotes);
  noteInput.addEventListener("input", function () {
    if (!noteTarget.disabled && noteTarget.value) {
      noteUiState.drafts[noteTarget.value] = {
        text: noteInput.value,
        type: noteType.value,
        updatedAt: Date.now()
      };
      clearNoteButton.disabled = !getManualNote(noteTarget.value) && !noteInput.value.trim();
      setNoteStatus("Rascunho ativo em " + pageDisplayLabel(PAGE_BY_ID.get(noteTarget.value)) + ".", "");
    }
  });
  noteInput.addEventListener("keydown", function (event) {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      saveManualNote();
    }
  });
  saveNoteButton.addEventListener("click", saveManualNote);
  clearNoteButton.addEventListener("click", clearManualNote);
  exportNotebookButton.addEventListener("click", exportNotebook);
  contextStudyList.addEventListener("submit", handleContextStudySubmit);
  unlockButton.addEventListener("click", tryUnlockFromInput);
  unlockCode.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      tryUnlockFromInput();
    }
  });
  resetProgressButton.addEventListener("click", function () {
    if (window.confirm("Resetar todo o progresso do tradutor?")) {
      resetProgress();
    }
  });
  window.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && helpModal.classList.contains("open")) {
      closeHelpModal();
    }
  });

  showStudyPanel("guia");
  renderExamples();
  setUnlockMessage("O volume comeca com lembrancas incompletas.", "");
  sourceText.value = "";
  updateStudyButtonState();
  updateAll();
}());
