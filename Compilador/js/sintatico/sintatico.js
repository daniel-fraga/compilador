// Compilador, copyright (c) by Bruno Camilo Silverio & Daniel de Arruda Fraga

/*  •Principal função: analisar a sequência de apresentação dos tokens, efetuando a síntese da análise sintática, com base na gramática da linguagem fonte.
    •Principais funções:
    –Identificação de sentenças
    –Detecção de erros de sintaxe
    –Recuperação de erros
    –Montagem de árvore abstrata da sentença
    –Ativação do analisador léxico
    –Ativação de rotinas da análise semântica
    –Ativação de rotinas da síntese do código objeto 
*/

let tabelasimbolos = [];
let nivel = 0;
let rotulo = 0; //GERACAO DE CODIGO

//Funcao principal do Sintatico
function sintatico() {
    console.log("***** start SINTATICO *****");
    //tokenslexico = JSON.stringify(tokenslexico);  //Para transformar em String
    nivel = 0;
    tabelasimbolos = [];

    rotulo = 1; //GERACAO DE CODIGO

    getToken();
    if (token.simbolo == "Sprograma") {
        getToken();
        if (token.simbolo == "Sidentificador") {
            tabelasimbolos.push({
                lexema: token.lexema,
                tipo: "nomePrograma",
                nivel: nivel
            });
            //GERACAO DE CODIGO
            geraSTART();
            
            geraSTART();
            getToken();
            if (token.simbolo == "Sponto_virgula") {
                Analisa_Bloco();
                if (token.simbolo == "Sponto") {
                    //GERACAO DE CODIGO
                    /*
                    if (Gvars > 0){
                        geraDALLOC(Goffset, Gvars);
                    }
                    */
                    getToken();
                    if (token.simbolo == undefined) {
                        //GERACAO DE CODIGO
                        geraHLT();
                        //geraCodigo(); //Apos geracao de codigo concluida, baixa arquivo
                        console.log(tabelasimbolos);
                        console.log("***** end SINTATICO *****");
                        document.getElementById('terminal').value = "Realizado com sucesso!";
                        alert("Executado com sucesso!");
                        //Valida se programa realmente acabou depois do ultimo ponto
                    } else {
                        //Erro pois tem coisa depois do ponto final
                        geraErroSintatico();
                    }
                } else {
                    //Faltou sponto
                    //geraErroSintatico();
                    alert("ERRO SINTATICO:\n" + "Lexema: fim " + "\nEsperado '.' ");
                    document.getElementById('terminal').value = "Erro SINTATICO:\n" + "Lexema: fim " + "\nEsperado '.' ";
                    //var listatokens = JSON.stringify(listatokens);
                    //document.getElementById('terminal').value = listatokens.split(',{').join("\n");
                    console.log("***** end SINTATICO *****");
                    throw new Error("ERRO SINTATICO");
                }
            } else {
                //Faltou sponto_virgula
                geraErroSintatico();
            }
        } else {
            //Faltou sidentificador
            geraErroSintatico();
        }
    } else {
        //Faltou sprograma
        geraErroSintatico();
    }
}


function getToken() {
    token = lexico();
    console.log("TOKEN: " + token.lexema + " LINHA: " + token.linha);
}

//Funcao para erros sintaticos
function geraErroSintatico() {
    alert("ERRO SINTATICO\nLexema: " + token.lexema + "\nLinha: " + token.linha);
    document.getElementById('terminal').value = "Erro SINTATICO:\n" + "Lexema: " + token.lexema + "\nLinha: " + token.linha;
    console.log("***** end SINTATICO *****");
    throw new Error("ERRO SINTATICO");
}

function Analisa_Bloco() {
    getToken();
    Analisa_et_variaveis();

    //GERACAO DE CODIGO
    /*
    let vars = tabela.NumeroDeVariaveisAlocadas(nivel);
    int offset = tabela.NumeroDeVariaveisAlocadasNoTotal() - vars;

    if(primeiravez){
        Gvars = vars;
        Goffset = offset;
        primeiravez = false;
    }
    if (vars > 0){
        geraALLOC(offset,vars);
    }    
    */

    Analisa_Subrotinas();
    Analisa_comandos();
}

//Etapa de declaração de variáveis
function Analisa_et_variaveis() {
    if (token.simbolo == "Svar") {
        getToken();
        if (token.simbolo == "Sidentificador") {
            while (token.simbolo == "Sidentificador") {
                Analisa_Variaveis();
                if (token.simbolo == "Sponto_virgula") {
                    getToken();
                } else {
                    geraErroSintatico();
                }
                //GERACAO DE CODIGO
                //geraLDV(tabela.getLabel(a.get(i)));
            }
        } else {
            geraErroSintatico();
        }
    }
}

//Declaração de variáveis
function Analisa_Variaveis() {
    do {
        if (token.simbolo == "Sidentificador") {
            if (!pesquisa_duplicvar_tabela(token.lexema, nivel)) { //validar em funcoes, proc e nomeprograma?
                tabelasimbolos.push({
                    lexema: token.lexema,
                    tipo: "var",
                    nivel: nivel,
                });
                console.log(token);
                getToken();
                if ((token.simbolo == "Svirgula") || (token.simbolo == "Sdoispontos")) {
                    if (token.simbolo == "Svirgula") {
                        getToken();
                        if (token.simbolo == "Sdoispontos") {
                            geraErroSintatico();
                        }
                    }
                } else {
                    console.log(token);
                    geraErroSintatico();
                }
            } else {
                geraErroSemantico();
            }
        } else {
            geraErroSintatico();
        }
    } while (token.simbolo != "Sdoispontos");
    getToken();
    Analisa_Tipo();
}

//Tipo
function Analisa_Tipo() {
    if ((token.simbolo != "Sinteiro") && (token.simbolo != "Sbooleano")) {
        geraErroSintatico();
    } else {
        coloca_tipo_tabela(token.lexema);
    }
    getToken();
}

//Comandos
function Analisa_comandos() {
    if (token.simbolo == "Sinicio") {
        getToken();
        Analisa_comando_simples();
        while (token.simbolo != "Sfim") {
            if (token.simbolo == "Sponto_virgula") {
                getToken();
                if (token.simbolo != "Sfim") {
                    Analisa_comando_simples();
                }
            } else {
                geraErroSintatico();
            }
        }
        getToken();
    } else {
        geraErroSintatico();
    }
}

//Comando
function Analisa_comando_simples() {
    if (token.simbolo == "Sidentificador") {
        Analisa_atrib_chprocedimento();
    } else {
        if (token.simbolo == "Sse") {
            Analisa_se();
        } else {
            if (token.simbolo == "Senquanto") {
                Analisa_enquanto();
            } else {
                if (token.simbolo == "Sleia") {
                    Analisa_leia();
                } else {
                    if (token.simbolo == "Sescreva") {
                        Analisa_escreva();
                    } else {
                        Analisa_comandos();
                    }
                }
            }
        }
    }
}

//atribuição_chamada_procedimento
function Analisa_atrib_chprocedimento() {
    let tokenantigo = token;
    getToken();   //talvez esse gettoken nao fique aqui ???
    if (token.simbolo == "Satribuicao") {
        Analisa_atribuicao(tokenantigo);
    } else {
        Chamada_procedimento(tokenantigo);
    }
}

//Comando leitura
function Analisa_leia() {
    getToken();
    if (token.simbolo == "Sabre_parenteses") {
        getToken();
        if (token.simbolo == "Sidentificador") {
            if (pesquisa_declvar_tabela(token.lexema)) { //mesmo nivel? Outros niveis?
                //GERACAO DE CODIGO
                //geraRD();
                //geraSTR(tabela.getLabel(atual));
                
                getToken();
                if (token.simbolo == "Sfecha_parenteses") {
                    getToken();
                } else {
                    geraErroSintatico();
                }
            } else {
                geraErroSemantico();
            }
        }
        else {
            geraErroSintatico();
        }
    } else {
        geraErroSintatico();
    }
}

//Comando escrita
function Analisa_escreva() {
    getToken();
    if (token.simbolo == "Sabre_parenteses") {
        if (pesquisa_declvarfunc_tabela(token.lexema)) {
            //GERACAO DE CODIGO
            //geraLDV(tabela.getLabel(atual));

            getToken();
        } else {
            if (pesquisa_declfunc_tabela(token.lexema)) {
                //GERACAO DE CODIGO
                //geraCALL(tabela.getLabel(atual));

                getToken();
            } 
            if (token.simbolo == "Sfecha_parenteses") {
                //GERACAO DE CODIGO
                //geraPRN();

                getToken();
            } else {
                geraErroSintatico();
            } 
        }
    } else {
        geraErroSintatico();
    }
}

//Comando repetição
function Analisa_enquanto() {
    let auxrot1 = 0;
    let auxrot2 = 0; 
    
    //GERACAO DE CODIGO
    //auxrot1 = rotulo;
    //geraNULL(rotulo);//INICIO DO WHILE
    //rotulo++;

    limpaPosFixo();
    getToken();
    Analisa_expressao();
    let retornoPosFixo = analisaPosFixo();
    if (retornoPosFixo === "Sbooleano" || retornoPosFixo === "Sverdadeiro" || retornoPosFixo === "Sfalso") {
        if (token.simbolo == "Sfaca") {
            //auxrot2 = rotulo;
            //geraJMPF(rotulo);//SALTA SE FALSO
            //rotulo++;

            getToken();
            Analisa_comando_simples();

            //geraJMP(auxrot1); //RETORNA INICIO LOOP
            //geraNULL(auxrot2);//FIM DO WHILE
        } else {
            geraErroSintatico();
        }
    } else {
        geraErroSemantico();
    }
}

//Comando condicional
function Analisa_se() {
    let auxrot = 0;
    auxrot = rotulo;
    let auxrot2 = 0;

    getToken();
    limpaPosFixo();
    Analisa_expressao();
    let retornoPosFixo = analisaPosFixo();
    if (retornoPosFixo === "Sbooleano" || retornoPosFixo === "Sverdadeiro" || retornoPosFixo === "Sfalso") {
        if (token.simbolo == "Sentao") {
            //GERACAO DE CODIGO
            //geraJMPF(auxrot);
            //rotulo++;

            getToken();
            Analisa_comando_simples();
            if (token.simbolo == "Ssenao") {
                //GERACAO DE CODIGO
                //auxrot2 = rotulo;
                //rotulo++;
                //geraJMP(auxrot2);
                //geraNULL(auxrot);

                getToken();
                Analisa_comando_simples();
            } else {
                //geraNULL(auxrot);
            }
        } else {
            geraErroSintatico();
        }
    } else {
        geraErroSemantico();
    }

}

//Etapa de declaração de sub-rotinas
function Analisa_Subrotinas() {
    let auxrot = 0;
    let flag = 0;

    if ((token.simbolo == "Sprocedimento") || (token.simbolo == "Sfuncao")) {
        //GERACAO DE CODIGO
        //auxrot = rotulo;
        //geraJMP(rotulo); //SALTA SUB-ROTINAS
        //rotulo++;
        //flag = 1;

        while ((token.simbolo == "Sprocedimento") || (token.simbolo == "Sfuncao")) {
            if (token.simbolo == "Sprocedimento") {
                Analisa_declaracao_procedimento();
            } else {
                Analisa_declaracao_funcao();
            }
            if (token.simbolo == "Sponto_virgula") {
                getToken();
            } else {
                geraErroSintatico();
            }
        }
    }
    //GERACAO DE CODIGO
    if (flag === 1) {
        geraNULL(auxrot); //INICIO DO PRINCIPAL
    }
}

//Declaração de procedimento
function Analisa_declaracao_procedimento() {
    getToken();
    if (token.simbolo == "Sidentificador") {
        if (!pesquisa_declproc_tabela(token.lexema)) { //procura tmbm var, fun ou programa?
            nivel++;
            tabelasimbolos.push({
                lexema: token.lexema,
                tipo: "proc",
                nivel: nivel
            });
            //GERACAO DE CODIGO
            //geraNULL(rotulo);//CALL irá buscar este rótulo na TabSimb
            //rotulo++;

            getToken();
            if (token.simbolo == "Sponto_virgula") {
                Analisa_Bloco();

                //GERACAO DE CODIGO
                /*
                int vars = tabela.NumeroDeVariaveisAlocadas(nivel);
                int offset = tabela.NumeroDeVariaveisAlocadasNoTotal() - vars;

                if (vars > 0){
                    geraDALLOC(offset, vars);
                    enderecoVar = enderecoVar - vars;
                }
                    geraRETURN();
                */
            } else {
                geraErroSintatico();
            }
        } else {
            geraErroSemantico();
        }
    } else {
        geraErroSintatico();
    }
    finalizaProcFunc(nivel);
    nivel--;
}

//Declaração de função
function Analisa_declaracao_funcao() {
    getToken();
    let tokenantigo = token; //NAO TA USANDO
    if (token.simbolo == "Sidentificador") {
        if (!pesquisa_declfunc_tabela(token.lexema)) {
            nivel++;
            tabelasimbolos.push({
                lexema: token.lexema,
                tipo: "func",
                nivel: nivel
            }); //AQUI TERIA QUE ADICIONAR O 'rotulo' NA TABELA DE SIMBOLOS
            getToken();

            //GERACAO DE CODIGO
            //geraNULL(rotulo);

            if (token.simbolo == "Sdoispontos") {
                getToken();
                if ((token.simbolo == "Sinteiro") || (token.simbolo == "Sbooleano")) {

                    if (token.simbolo == "Sinteiro") {
                        tabelasimbolos[tabelasimbolos.length - 1].tipo = "func inteiro";
                    } else {
                        tabelasimbolos[tabelasimbolos.length - 1].tipo = "func booleano";
                    }

                    //rotulo++;

                    getToken();
                    if (token.simbolo == "Sponto_virgula") {
                        Analisa_Bloco();

                        //GERACAO DE CODIGO
                        /*
                        int vars = tabela.NumeroDeVariaveisAlocadas(nivel);
                        int offset = tabela.NumeroDeVariaveisAlocadasNoTotal() - vars;

                        geraRETURNF(offset, vars);
                        */
                    }
                } else {
                    geraErroSintatico();
                }
            } else {
                geraErroSintatico();
            }
        } else {
            geraErroSemantico();
        }
    } else {
        geraErroSintatico();
    }
    finalizaProcFunc(nivel);
    nivel--;
}

//Expressão
function Analisa_expressao() {
    Analisa_expressao_simples();
    if ((token.simbolo == "Smaior") || (token.simbolo == "Smaiorig") || (token.simbolo == "Sig") || (token.simbolo == "Smenor") || (token.simbolo == "Smenorig") || (token.simbolo == "Sdif")) {
        //GERACAO DE CODIGO
        if (token.simbolo == "Smaior") {
            geraCMA();
        } else if (token.simbolo == "Smaiorig") {
            geraCMAQ();
        } else if (token.simbolo == "Sig") {
            geraCEQ();
        } else if (token.simbolo == "Smenor") {
            geraCME();
        } else if (token.simbolo == "Smenorig") {
            geraCMEQ();
        } else if (token.simbolo == "Sdif") {
            geraCDIF();
        }
        
        posFixoGerador();
        getToken();
        Analisa_expressao_simples();
    }
}

//Expressao simples
function Analisa_expressao_simples() {
    //dividir mais e menos para gerar menos unitario do posfixo?
    if (token.simbolo == "Smais") {
        //GERACAO DE CODIGO
        geraADD();
        
        //POSFIXO EM UNITARIO
        getToken();
    }
    if (token.simbolo == "Smenos") {
        //POSFIXO EM UNITARIO
        token.simbolo = "Smenosu";

        //GERACAO DE CODIGO
        geraNEG();

        console.log(token);
        posFixoGerador();
        getToken();
    }

    Analisa_termo();
    while ((token.simbolo == "Smais") || (token.simbolo == "Smenos") || (token.simbolo == "Sou")) {
        //GERACAO DE CODIGO
        if (token.simbolo == "Smais") {
            geraADD();
        } else if (token.simbolo == "Smenos") {
            geraSUB();
        } else if (token.simbolo == "Sou") {
            geraOR();
        }

        posFixoGerador();
        getToken();
        Analisa_termo();
    }
}

//Termo
function Analisa_termo() {
    Analisa_fator();
    while ((token.simbolo == "Smult") || (token.simbolo == "Sdiv") || (token.simbolo == "Se")) {
        //GERACAO DE CODIGO
        if (token.simbolo == "Smult") {
            geraMULT();
        } else if (token.simbolo == "Sdiv") {
            geraDIVI();
        } else if (token.simbolo == "Se") {
            geraAND();
        }

        posFixoGerador();
        getToken();
        Analisa_fator();
    }
}

//Fator
function Analisa_fator() {
    posFixoGerador();
    if (token.simbolo == "Sidentificador") {
        if (!pesquisa_declvar_tabela(token.lexema)) { //o que faz pesquisa tabela?
            if (pesquisa_declfunc_tabela(token.lexema)) {
                //POSFIXO
                Analisa_chamada_funcao();
            } else {
                //getToken(); //SEMANTICO
                geraErroSemantico();
            }
        } else {
            //POSFIXO
            getToken()
        }
    } else if (token.simbolo == "Snumero") {
        //GERACAO DE CODIGO
        //geraLDC(a.get(i).getLexema().getValor());

        //POSFIXO
        getToken();
    } else if (token.simbolo == "Snao") {
        //GERACAO DE CODIGO
        geraNEG();

        //POSFIXO
        getToken();
        Analisa_fator();
    } else if (token.simbolo == "Sabre_parenteses") {
        //POSFIXO
        getToken();
        Analisa_expressao();
        if (token.simbolo == "Sfecha_parenteses") {
            posFixoGerador();
            getToken();
        } else {
            geraErroSintatico();
        }
    } else if (token.simbolo == "Sverdadeiro" || token.simbolo == "Sfalso") {
        //GERACAO DE CODIGO
        /*if(token.simbolo == "Sverdadeiro"){
            geraLDC(1);
        } else { 
            geraLDC(0);
        }*/

        //POSFIXO
        getToken();
    } else {
        geraErroSintatico();
    }
}

function Analisa_chamada_funcao() {
    if (token.simbolo == "Sidentificador") {
        if (pesquisa_declfunc_tabela(token.lexema)) {
            getToken();
        } else {
            geraErroSemantico();
        }
        //GERACAO DE CODIGO
        //geraCALL(tabela.getLabel(old));
    } else {
        geraErroSintatico();
    }
}

function Chamada_procedimento(tokenantigo) {
    if (pesquisa_declproc_tabela(tokenantigo.lexema)) {
        //GERACAO DE CODIGO
        //geraCALL(tabela.getLabel(old));
    } else {
        geraErroSemantico();
    }

}

function Analisa_atribuicao(tokenantigo) {
    getToken();
    limpaPosFixo();
    Analisa_expressao();
    let retornoPosFixo = analisaPosFixo();
    let tipoVar = buscaTipo(tokenantigo.lexema);

    if (tipoVar === "var inteiro" || tipoVar === "func inteiro") {
        if (retornoPosFixo != "Sinteiro" && retornoPosFixo != "Snumero") {
            console.log(retornoPosFixo);
            geraErroSemantico();
        }
        //GERACAO DE CODIGO
        //geraSTR(tabela.getLabel(old));
    } else {
        if (tipoVar === "var booleano" || tipoVar === "func booleano") {
            if (retornoPosFixo != "Sbooleano" && retornoPosFixo != "Sverdadeiro" && retornoPosFixo != "Sfalso") {
                geraErroSemantico();
            }
        } else {
            geraErroSemantico();
        }
    }
}