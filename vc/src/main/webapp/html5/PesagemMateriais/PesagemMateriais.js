angular
	.module('PesagemMateriaisApp', ['snk'])
	.controller('PesagemMateriaisController', ['DateUtils', '$scope', 'StringUtils', 'ServiceProxy', 'MessageUtils', 'i18n', 'ObjectUtils', 'Criteria', 'NumberUtils', 'SanPopup', 'MGEParameters', 'SkApplicationInstance', 'AngularUtil', '$q', 'DatasetEvents', 'CrudUtils',
		function (DateUtils, $scope, StringUtils, ServiceProxy, MessageUtils, i18n, ObjectUtils, Criteria, NumberUtils, SanPopup, MGEParameters, SkApplicationInstance, AngularUtil, $q, DatasetEvents, CrudUtils) {
			var self = this;
			ObjectUtils.implements(self, IDatagridInterceptor);
			ObjectUtils.implements(self, IFormInterceptor);
			ObjectUtils.implements(self, IDynaformInterceptor);

			//const CONFIRMA_ULTIMO_APONTAMENTO_MP_FIXO	= "br.com.sankhya.mgeprod.confirma.ultimo.apontamento.mp.fixo";
			//const CLIENT_EVENT_MPALT_QTDMISTURA_MP_NAO_ATENDIDA = "br.com.sankhya.mgeprod.operacaoproducao.mpalt.apontamentomp.qtdmistura.naoatendido";

			var TELA_OP = "gerenciafretes.ui_PesagemMateriais";

			var TIPO_BUSCA_CONSTANTE = 'C';
			var TIPO_BUSCA_AO_SOLICITAR = 'S';
			$scope.qtdPesoLabel = "000.0000"

			var _timeInstanceBtnPesar;
			var _goRowIdVolume;
			self.qtdPeso2;

			self.showInputControle = MGEParameters.asBoolean('com.utiliza.controle');
			self.portaWebSocket = MGEParameters.asInteger('mge.porta.websocket.webconnection');

			self.resourceID = SkApplicationInstance.getResourceID();
			self.isTelaPesagemMateriaisOP;

			self.onDatasetHistPesagemMateriaisCreated = onDatasetHistPesagemMateriaisCreated;
			self.onDatasetHistPesagemMateriaisAddCreated = onDatasetHistPesagemMateriaisAddCreated;
			self.onDatasetProdutotCreated = onDatasetProdutotCreated;

			self.onDatagridLoaded = onDatagridLoaded;
			self.gridHistPesagemMateriaisConfig = self.resourceID + '.GridHistPesagemMateriais';

			/* 	self.optionsTipoPeso = [{ data: 'N', value: i18n('GerenciaFretes.PesagemMateriais.cbTipoNormal') },
										{ data: 'P', value: i18n('GerenciaFretes.PesagemMateriais.cbTipoPerda') }]; */

			self.eventBtnSelecinaOPandIDvolume = eventBtnSelecinaOPandIDvolume;
			self.eventBtnConfiguracoes = eventBtnConfiguracoes;
			self.eventBtnReimprimir = eventBtnReimprimir;
			self.eventBtnNovaOP = eventBtnNovaOP;
			self.eventBtnPesar = eventBtnPesar;
			self.eventBtnExcluir = eventBtnExcluir;
			self.eventBtnConfirmar = eventBtnConfirmar;

			self.cellFormatter = cellFormatter;

			self.acceptField = acceptField;
			self.interceptColumnMetadata = interceptColumnMetadata;

			self.countBuscouPesoInvalido = 0;
			self.tentarReconectarWebSocket = true;
			self.procedureBuscaIncrementoCriada = false;
			self.wasChangeOP = true;

			var _camposAdicionais = [];
			var _adicionaisValues = [];

			var _divergenciaApontamento;
			var _pesocaptura = true;
			var _confirmarcaptura = false;

			init();

			function init() {
				//GridConfig.registerGridConfig(self.gridHistPesagemMateriaisConfig, self.gridHistPesagemMateriaisConfig, undefined, true);

				clientEventsTela();

				if (TELA_OP == self.resourceID) {
					// Tela OP
					self.isTelaPesagemMateriaisOP = true;
					self.msgConfirmExclusao = i18n('GerenciaFretes.PesagemMateriais.msgConfirmExclusaoOP');
				} else {
					// Tela ID Volume
					self.labelInfoPesoVolume = i18n('GerenciaFretes.PesagemMateriais.lblInformeIdVolume');
					self.msgConfirmExclusao = i18n('GerenciaFretes.PesagemMateriais.msgConfirmExclusaoIDvolume');
					self.isTelaPesagemMateriaisOP = false;
				}

				loadConfigFilter();

				ServiceProxy
					.callService('mge@AcaoProgramadaSP.procedureExists', { action: { procName: 'BUSCA_INCREMENTO_PESAGEM' } }, { 'ignoreLoadingBar': true })
					.then(function (result) {
						var action = result.responseBody.action;

						if (action) {
							self.procedureBuscaIncrementoCriada = (action.procedureExists == 'true');
						}

					});


			}

			function clientEventsTela() {
				ServiceProxy.addClientEvent('br.com.sankhya.mgeprod.apontamentoconjunta.msgqtdmaior', function (clientEvent) {
					self.isAceitarQtdMaior = true;
					confirmApontamentoComAfter();
				});

				ServiceProxy.addClientEvent('br.com.sankhya.mgeprod.operacaoproducao.mpalt.proporcao.apontamento.invalida', function (clientEvent) {
					self.isAceitaPropInvalidMPAlternative = true;
					confirmApontamentoComAfter();
				});

				ServiceProxy.addClientEvent('br.com.sankhya.mgeProd.apontamento.ultimo', function (clientEvent) {
					self.isRespostaUltimoApontamento = false;
					self.processaPerdaUltimoApontamento = true;
					confirmApontamentoComAfter();
				});

				ServiceProxy.addClientEvent('br.com.sankhya.mgeProd.wc.indisponivel', function (clientEvent) {
					self.isAceitaWcIndisponivel = true;
					confirmApontamentoComAfter();
				});

				ServiceProxy.addClientEvent('br.com.sankhya.apontamentomp.naoreproporcionalizado', function (clientEvent, recaller) {
					//MessageUtils.showAlert(MessageUtils.TITLE_WARNING, i18n('GerenciaFretes.abaInclusaoItensApontamentos.alertaMPNaoReproporcionalizada'));
				});

				/* 				ServiceProxy.addClientEvent(
									CONFIRMA_ULTIMO_APONTAMENTO_MP_FIXO,
									function (eventContent, serviceRecaller) {
										self.popUpApontamentoMpFixa = true;
										self.confirmadoApontamentoMpFixa = true;
										confirmApontamentoComAfter();
									}); */


				/* 				if (!ServiceProxy.hasClientEvent(CLIENT_EVENT_MPALT_QTDMISTURA_MP_NAO_ATENDIDA)) {
									ServiceProxy.addClientEvent(
										CLIENT_EVENT_MPALT_QTDMISTURA_MP_NAO_ATENDIDA,
										function (eventContent, serviceRecaller) {
											MessageUtils.showAlert(MessageUtils.TITLE_CONFIRMATION, i18n("GerenciaFretes.OperacaoProducao.msgErroReproporcaoMpComMpAlt"));
										}
									);
								} */
			}

			function startWebSocket() {
				if (StringUtils.isEmpty(self.inputOP) && StringUtils.isEmpty(self.webSocket)) {
					return;
				}

				self.stopWebSocket = false;
				self.tentarReconectarWebSocket = true;

				// Nao precisamos recriar o objeto websocket a todo momento quando seu status estiver em aberto.
				if (self.webSocket && self.webSocket.readyState === WebSocket.OPEN) {
					return;
				}

				var url = "ws://localhost:" + self.portaWebSocket + "/balanca/pesagem";

				// Ao criar um objeto WebSocket automaticamente e feito uma tentativa de abertura de conexao ao servidor.
				self.webSocket = new WebSocket(url);
				self.webSocket.onopen = function (event) {
					self.webSocket.send("{\"comando\":\"getpesoV2\"}"); // Sends data to server.

					console.log('webSocket.onopen');
				};
				self.webSocket.onmessage = function (event) {
					if (self.stopWebSocket) {
						return;
					} else if (StringUtils.isEmpty(self.inputOP)) {
						return;
					} else if (!self.isTelaPesagemMateriaisOP && StringUtils.isEmpty(self.inputIdVolume == undefined)) {
						return;
					} else if (!self.isTelaPesagemMateriaisOP && self.isClickBtnEnter != undefined && !self.isClickBtnEnter && _pesocaptura == true) {
						return;
					}

					var objPeso = JSON.parse(event.data);

					if (objPeso) {
						var qtdPeso = NumberUtils.getNumberOrZero(objPeso.peso);
						$scope.qtdPesoLabel = formataPeso(objPeso.peso);
						$scope.$apply();
						if (TIPO_BUSCA_CONSTANTE == self.tipoBuscaPeso) {
							if (qtdPeso <= 0) {
								return;
							}
						} else if (TIPO_BUSCA_AO_SOLICITAR == self.tipoBuscaPeso) {
							if (!self.isClickBtnPesar) {
								self.countBuscouPesoInvalido = 0;
								return;
							}

							if (qtdPeso <= 0) {
								self.countBuscouPesoInvalido++;

								if (self.countBuscouPesoInvalido == 5) {
									stopWebSocket();

									MessageUtils.showAlert(MessageUtils.TITLE_WARNING, "Peso capturado menor ou igual a zero [" + qtdPeso + "].");

									self.isClickBtnPesar = false;
									self.countBuscouPesoInvalido = 0;
								}

								return;
							}
						} else {
							return;
						}

						self.isClickBtnPesar = false;
						self.countBuscouPesoInvalido = 0;

						callServiceInserirPesagem(qtdPeso);
					}
				};
				self.webSocket.onerror = function (error) {
					MessageUtils.showError(MessageUtils.TITLE_ERROR, "Não foi possível estabelecer uma conexão com o servidor: " + url);
					if (self.webSocket && self.webSocket.readyState === WebSocket.OPEN) {
						self.webSocket.close();
					}

					self.tentarReconectarWebSocket = false;
				};

				self.webSocket.onclose = function (event) {
					console.log('webSocket.onclose');
					if (self.tentarReconectarWebSocket) {
						console.log('webSocket.tryreopen');
						startWebSocket(); // Tentamos abrir a conexao novamente. Para o caso onde se perde a conexao com a tela ainda em uso.
					}

				};
			}

			function stopWebSocket() {
				self.stopWebSocket = true;
			}

			function formataPeso(peso) {
				while (peso.length < 8) {
					peso = "0" + peso;
				}
				return peso;
			}

			function eventBtnConfirmar() {
				_pesocaptura = true;
				_confirmarcaptura = true;
				buscaApontamentosBaseExclusao().then(apontamentosBase => {
					validaDivergenciaExclusao(apontamentosBase);
					if (_divergenciaApontamento) {
						MessageUtils.showAlertWithConfirm(MessageUtils.TITLE_WARNING, i18n('GerenciaFretes.PesagemMateriais.alertConvergenciaApontamento')).then(function () {
							eventBtnSelecinaOPandIDvolume();
						});
						return;
					}
					buscaApontamentosBaseInclusao().then(apontamentosBaseInclusao => {
						validaDivergenciaInclusao(apontamentosBaseInclusao);
						if (_divergenciaApontamento) {
							MessageUtils.showAlertWithConfirm(MessageUtils.TITLE_WARNING, i18n('GerenciaFretes.PesagemMateriais.alertConvergenciaApontamento')).then(function () {
								eventBtnSelecinaOPandIDvolume();
							});
							return;
						}

						saveEditModeRecord();

						if (StringUtils.isEmpty(self.inputOP)) {
							return;
						}

						stopWebSocket();

						MessageUtils
							.simpleConfirm(MessageUtils.TITLE_CONFIRMATION, i18n('GerenciaFretes.PesagemMateriais.msgConfirmCriarApontamento'), false, false, { focusOnButton: 'ok' })
							.then(function () {
								confirmApontamentoComAfter();
							}, function (reason) {
								if (reason === 'no') {
									startWebSocket();
								}
							});
					});
				});

			}

			function confirmApontamentoComAfter() {
				confirmApontamento().then(function () {
					if (self.wasChangeOP) {
						limparCamposTela();
						startWebSocket();
					} else {
						eventBtnSelecinaOPandIDvolume();
					}
				}, function () {
					limparCamposTela();
					startWebSocket();
				});
			}

			function confirmApontamento() {
				var deferred = $q.defer();

				var qtdPeso = self.inputPesoNormal.replace('.', '');
				qtdPeso = Number.parseFloat(qtdPeso.replace(',', '.'));

				var qtdPesoPerda = self.inputPesoPerda.replace('.', '');
				qtdPesoPerda = Number.parseFloat(qtdPesoPerda.replace(',', '.'));

				ServiceProxy
					.callService('mgeprod@OperacaoProducaoSP.confirmarPesagemVolume', {
						IDIPROC: self.inputOP,
						IDIATV: self.IDIATV,
						IDEFX: self.IDEFX,
						CODPROD: self.CODPROD,
						CONTROLE: self.inputControle,
						DESCRPROD: self.inputProduto,
						PESO: qtdPeso,
						PESOPERDA: qtdPesoPerda,
						ACEITARQTDMAIOR: self.isAceitarQtdMaior == undefined ? false : self.isAceitarQtdMaior,
						RESPOSTA_ULTIMO_APONTAMENTO: self.isRespostaUltimoApontamento == undefined ? false : self.isRespostaUltimoApontamento,
						ACEITA_PROPORCAO_INVALIDA_MPALTERNATIVA: self.isAceitaPropInvalidMPAlternative == undefined ? false : self.isAceitaPropInvalidMPAlternative,
						ACEITA_WC_INDISPONIVEL: self.isAceitaWcIndisponivel == undefined ? false : self.isAceitaWcIndisponivel,
						PROCESSA_PERDA_ULTIMO_APONTAMENTO: self.processaPerdaUltimoApontamento == undefined ? false : self.processaPerdaUltimoApontamento,
						CONFIRMACAOAUTO: self.isConfirmacaoAuto,
						POPUP_APONTAMENTO_MP_FIXO_MOSTRADO: self.popUpApontamentoMpFixa == undefined ? false : self.popUpApontamentoMpFixa,
						CONFIRMADO_ULTIMO_APONTAMENTO_MP_FIXO: self.confirmadoApontamentoMpFixa == undefined ? false : self.confirmadoApontamentoMpFixa
					})
					.then(function (result) {
						self.isAceitarQtdMaior = undefined;
						self.isAceitaPropInvalidMPAlternative = undefined;
						self.isRespostaUltimoApontamento = undefined;
						self.isAceitaWcIndisponivel = undefined;
						self.processaPerdaUltimoApontamento = undefined;

						deferred.resolve();
					}, function (result) {
						deferred.reject();
					});

				return deferred.promise
			}

			function eventBtnExcluir() {
				saveEditModeRecord();

				stopWebSocket();

				var copyRecordsSelected = self.dsHistPesagemMateriais.getSelectedRecordsAsObjects().slice();

				if (copyRecordsSelected.length == 0) {
					var arrayObj = [];
					if (!self.dsHistPesagemMateriais.getCurrentRowAsObject()) {
						return;
					}
					arrayObj.push(self.dsHistPesagemMateriais.getCurrentRowAsObject());
					copyRecordsSelected = arrayObj;
				}

				MessageUtils
					.simpleConfirm(MessageUtils.TITLE_CONFIRMATION, self.msgConfirmExclusao, false, false, { focusOnButton: 'ok' })
					.then(function () {
						ServiceProxy
							.callService('mgeprod@OperacaoProducaoSP.removerPesagemVolume', {
								LISTVOLUMES: copyRecordsSelected,
								TELAOP: self.isTelaPesagemMateriaisOP
							})
							.then(function (result) {
								self.dsHistPesagemMateriais.refresh();
								startWebSocket();
							});
					}, function (reason) {
						if (reason === 'no') {
							startWebSocket();
						}
					});
			}

			function callServiceInserirPesagem(qtdPeso) {
				self.tipo = self.dsHistPesagemMateriaisAdd.getFieldValueAsString("TIPO");

				var arrayAdicionais = [];
				if (self.dsHistPesagemMateriaisAdd && self.dsHistPesagemMateriaisAdd.getCurrentRowAsObject() && _camposAdicionais) {
					_camposAdicionais.forEach(function (field) {
						var fieldValue = self.dsHistPesagemMateriaisAdd.getFieldValue(field.name);

						if ("H" === field.dataType || "D" === field.dataType) {
							fieldValue = DateUtils.dateToString(fieldValue, DateUtils.DEFAULT_DATETIME_FORMAT)
						}

						arrayAdicionais.push({ data: field.name, value: fieldValue, dataType: field.dataType });
					});
				}

				_adicionaisValues = arrayAdicionais;

				saveConfig();
				stopWebSocket();

				var loadRecordRequest = {
					dataSetID: self.dsHistPesagemMateriais.getDatasetId(),
					entityName: self.dsHistPesagemMateriais.getEntityName(),
					standAlone: self.dsHistPesagemMateriais.isStandAlone(),
					fields: self.dsHistPesagemMateriais.getFieldNames(true),
					standAloneFieldsMD: self.dsHistPesagemMateriais.getStandAloneFieldsMD(),
				};

				var currentIndex = self.dsHistPesagemMateriais.getCurrentIndex();

				ServiceProxy
					.callService('mgeprod@OperacaoProducaoSP.inserirPesagemVolume', {
						IDIPROC: self.inputOP == "" ? undefined : self.inputOP,
						IDIATV: self.IDIATV == "" ? undefined : self.IDIATV,
						CODPROD: self.CODPROD == "" ? undefined : self.CODPROD,
						CONTROLE: self.inputControle,
						LOTE: self.inputLote,
						PESO: qtdPeso,
						IDVOLUME: self.inputIdVolume,
						TIPO: self.tipo,
						ADICIONAIS: arrayAdicionais,
						loadRecordRequest: loadRecordRequest,
						procedureBuscaIncrementoCriada: self.procedureBuscaIncrementoCriada
					})
					.then(function (result) {
						self.isClickBtnEnter = false;
						self.stopWebSocket = false;

						var registros = result.responseBody.result;

						if (registros) {
							if (self.isTelaPesagemMateriaisOP) {
								self.dsHistPesagemMateriais.addRecords(registros);
							} else {
								var currentIndexIdVolume = self.dsHistPesagemMateriais.findRecordIndexByPk({ 'ID': self.inputIdVolume });

								if (currentIndexIdVolume > -1) {
									var registroAtual = self.dsHistPesagemMateriais.getRecord(currentIndexIdVolume);

									if (registroAtual) {
										self.dsHistPesagemMateriais.updateRecord(registroAtual, registros[0]);
									} else {
										self.dsHistPesagemMateriais.refresh();
									}
								}
							}
						} else {
							self.dsHistPesagemMateriais.refresh();
						}

						if (!self.isTelaPesagemMateriaisOP) {
							self.inputTemp = self.isTelaPesagemMateriaisOP ? self.inputNroOP : self.inputIdVolume;
							self.labelInfoPesoVolume = i18n('GerenciaFretes.PesagemMateriais.lblInformeIdVolume');
							self.inputIdVolume = undefined;
						}
					}, function () {
						self.stopWebSocket = false;
					});
			}

			function eventBtnPesar() {
				_pesocaptura = false;
				saveEditModeRecord();

				if (!self.isTelaPesagemMateriaisOP && StringUtils.isEmpty(self.inputIdVolume)) {
					setFocusInputMain();
					return;
				} else if (self.isTelaPesagemMateriaisOP && StringUtils.isEmpty(self.inputNroOP)) {
					setFocusInputMain();
					return;
				}

				self.stopWebSocket = false;
				self.isClickBtnPesar = true;
			}

			$(document).on('keydown', function (e) {
				if (e.which === 113 && self.isEnabledBtn) {// F2
					eventBtnReimprimir();
				} else if (e.which === 120 && self.isEnabledBtn) {// F9
					eventBtnExcluir();
				} else if (e.which === 119) {// F8
					if (self.isTelaPesagemMateriaisOP) {
						eventBtnNovaOP();
					}
				} else if (e.which === 117) {// F6
					eventBtnPesar();
				} else if (e.which === 118 && self.isEnabledBtn) {// F7
					eventBtnConfirmar();
				}
			});

			$scope.runScript = function (keyEvent) {
				if (keyEvent.which === 13) {
					self.isClickBtnEnter = true;
					eventBtnSelecinaOPandIDvolume();
				}
			}

			function eventBtnSelecinaOPandIDvolume() {
				if (StringUtils.isEmpty(self.inputOP)) {
					self.isVisibleAguardandoPeso = false;
				}

				saveEditModeRecord();

				if (self.wasChangeOP && verificaConfirmacaoApontamentoAutomatica(false)) {
					if (StringUtils.isEmpty(self.inputOP)) {
						return;
					}

					stopWebSocket();

					self.wasChangeOP = false;

					confirmApontamento().then(function () {
						afterConfirmaApontamentoChangeVolme();
					}, function () {
						afterConfirmaApontamentoChangeVolme();
					});

					return;
				}

				if (self.wasChangeOP && _confirmarcaptura) {
					_pesocaptura = false;
					stopWebSocket();
				}

				self.wasChangeOP = true;

				//inputTempo serve para verificar o change de OP/Id volume
				self.inputTemp = self.isTelaPesagemMateriaisOP ? self.inputNroOP : self.inputIdVolume;

				ServiceProxy
					.callService('mgeprod@OperacaoProducaoSP.getPesagemMateriaisOPandIDvolume', {
						IDIPROC: StringUtils.isEmpty(self.inputNroOP) ? undefined : self.inputNroOP,
						IDVOLUME: StringUtils.isEmpty(self.inputIdVolume) ? undefined : self.inputIdVolume,
						TELAOP: self.isTelaPesagemMateriaisOP
					})
					.then(function (result) {
						processaInstanciaAtividade(result)
					});
			}

			function processaInstanciaAtividade(result) {
				var records = result.responseBody.allInstanciaAtv;

				if (StringUtils.isEmpty(records)) {
					limparCamposTela();
					return;
				}

				var isMoreProdutos = records.length > 1;

				if (isMoreProdutos) {
					buildRecordsProduto(records)

					var popupInstance = SanPopup.open({
						title: i18n('GerenciaFretes.PesagemMateriais.titleProdutosOP'),
						templateUrl: 'html5/PesagemMateriais/popup/ProdutosPopUp.tpl.html',
						controller: 'ProdutoController',
						controllerAs: 'ctrl',
						size: 'md', //size: 'sm' ; lg ; md ; alert
						showBtnOk: false,
						showBtnNo: false,
						showBtnCancel: false,
						resolve: {
							data: {
								dsProduto: self.dsProduto
							}
						}
					});
					popupInstance.result
						.then(function (resultIndex) {
							for (var i = 0; i < records.length; i++) {
								if (resultIndex == i) {
									setFieldsTela(records, i);
								}
							};
						}, function (cancel) {
						});
				} else {
					setFieldsTela(records, 0);
				}
			}

			function setFieldsTela(records, index) {
				if (records && records.length > 0) {
					if ("S" == records[index].ATV_NOT_EXECUTE) {
						MessageUtils.showError(MessageUtils.TITLE_ERROR, "Executante não tem permissão para acessar OP/Atividade [" + records[index].DESCRICAO + "].");
						return;
					}

					self.IDIATV = records[index].IDIATV;
					self.IDEFX = records[index].IDEFX;
					self.CODPROD = records[index].CODPROD;
					self.DECQTD = records[index].DECQTD;

					self.inputOP = records[index].IDIPROC;
					self.inputAtividade = records[index].ATIVIDADE;
					self.inputProduto = records[index].CODPROD + " - " + records[index].DESCRPROD;
					self.inputControle = records[index].CONTROLE;
					self.inputLote = records[index].NROLOTE;
					self.inputTamLote = NumberUtils.format(records[index].TAMLOTE, records[index].DECQTD);

					self.inputQtdApontada = records[index].QTDAPONTADA;

					self.inputQtdPesada = NumberUtils.format(records[index].QTDAPONTADA, records[index].DECQTD);
					self.inputSaldo = NumberUtils.format(records[index].TAMLOTE - records[index].QTDAPONTADA, records[index].DECQTD);

					self.dsHistPesagemMateriais.refresh();

					if (!self.isTelaPesagemMateriaisOP) {
						self.labelInfoPesoVolume = i18n('GerenciaFretes.PesagemMateriais.lblAguardandoIdVolume', [self.inputIdVolume])
					}

					startWebSocket();

					//Perder o foco do input OP/ID Volume ao ser pesquisado.
					if (TELA_OP == self.resourceID) {
						document.getElementById("inputNroOP").blur();

						self.isVisibleAguardandoPeso = true;
					} else {
						document.getElementById("inputIdVolume").blur();
						_goRowIdVolume = self.inputIdVolume;
					}
				}
			}

			function buildRecordsProduto(records) {
				var recordsProduto = [];

				for (var i = 0; i < records.length; i++) {
					var objProduto = new Object();
					objProduto.CODPROD = records[i].CODPROD;
					objProduto.DESCRPROD = records[i].DESCRPROD;
					objProduto.CONTROLE = records[i].CONTROLE;

					recordsProduto.push(angular.copy(objProduto));
				};

				self.dsProduto.clearDataSet();
				self.dsProduto.addRecordsAsObjects(recordsProduto);
				self.dsProduto.getRecordsList().refresh();
			}

			function eventBtnReimprimir() {
				saveEditModeRecord();

				stopWebSocket();

				var copyRecordsSelected = self.dsHistPesagemMateriais.getSelectedRecordsAsObjects().slice();
				var idInicial = 0;
				var idFinal = 0;

				if (self.dsHistPesagemMateriais.getCurrentRowAsObject() && copyRecordsSelected[0]) {
					if (copyRecordsSelected.length == 0) {
						idInicial = self.dsHistPesagemMateriais.getCurrentRowAsObject().ID;
						idFinal = idInicial;
					} else {
						for (var i = 0; i < copyRecordsSelected.length; i++) {
							if (idInicial == 0) {
								idInicial = copyRecordsSelected[i].ID;
								idFinal = copyRecordsSelected[i].ID;
							}

							if (copyRecordsSelected[i].ID < idInicial) {
								idInicial = copyRecordsSelected[i].ID;
							}

							if (copyRecordsSelected[i].ID > idFinal) {
								idFinal = copyRecordsSelected[i].ID;
							}
						};
					}
				}

				var popupInstance = SanPopup.open({
					title: i18n('GerenciaFretes.PesagemMateriais.titleReimprimir'),
					templateUrl: 'html5/PesagemMateriais/popup/ReimprimirPopUp.tpl.html',
					controller: 'ReimprimirController',
					controllerAs: 'ctrl',
					size: 'alert', //size: 'sm' ; lg ; md ; alert
					okBtnLabel: '[ Enter ] Reimprimir',
					cancelBtnLabel: '[ Esc ] Cancelar',
					resolve: {
						data: {
							idInicial: idInicial,
							idFinal: idFinal
						}
					}
				});
				popupInstance.result
					.then(function (result) {
						ServiceProxy
							.callService('mgeprod@OperacaoProducaoSP.reimprimirPesagemVolume', {
								IDINICIAL: result.idInicial,
								IDFINAL: result.idFinal
							})
							.then(function (result) {
								startWebSocket();
							});
					}, function (cancel) {
						startWebSocket();
					});
			}

			function eventBtnConfiguracoes() {
				saveEditModeRecord();

				stopWebSocket();

				var popupInstance = SanPopup.open({
					title: i18n('GerenciaFretes.PesagemMateriais.btnConfiguracoes'),
					templateUrl: 'html5/PesagemMateriais/popup/ConfiguracoesPopUp.tpl.html',
					controller: 'ConfiguracoesController',
					controllerAs: 'ctrl',
					size: 'md', //size: 'sm' ; lg ; md ; alert
					okBtnLabel: '[ Enter ] Confirmar',
					cancelBtnLabel: '[ Esc ] Cancelar',
					resolve: {
						data: {
							tipoBuscaPeso: self.tipoBuscaPeso,
							confirmacaoAuto: self.isConfirmacaoAuto,
							isTelaPesagemMateriaisOP: self.isTelaPesagemMateriaisOP
						}
					}
				});
				popupInstance.result
					.then(function (result) {
						self.tipoBuscaPeso = result.tipoBuscaPeso;
						self.isConfirmacaoAuto = result.confirmacaoAuto;
						saveConfig();
						startWebSocket();
					}, function (cancel) {
						startWebSocket();
					});
			}

			function getCriteriaHistPesagemMateriais() {
				var criteria = Criteria();

				criteria.append("this.IDIPROC = ? AND this.IDIATV = ? AND this.CODPROD = ? AND (nullValue(this.CONTROLE, ' ' ) = ' ' OR this.CONTROLE = ?) AND this.NUAPO IS NULL ");

				if (!self.isTelaPesagemMateriaisOP) {
					criteria.append(" AND EXISTS (SELECT 1 FROM TPRAVO WHERE IDIPROC = this.IDIPROC AND ID = ? AND NUAPO IS NULL)");
				}

				criteria.addParameter(Criteria.buildParameter('N', self.inputOP));
				criteria.addParameter(Criteria.buildParameter('N', self.IDIATV));
				criteria.addParameter(Criteria.buildParameter('N', self.CODPROD));
				criteria.addParameter(Criteria.buildParameter('S', self.inputControle));

				if (!self.isTelaPesagemMateriaisOP) {
					let inputVolume = StringUtils.isEmpty(self.inputIdVolume) ? self.inputTemp : self.inputIdVolume;
					criteria.addParameter(Criteria.buildParameter('N', StringUtils.isEmpty(inputVolume) ? 0 : inputVolume));
				}

				return criteria;
			}

			function onDatasetHistPesagemMateriaisCreated(dataset) {
				self.dsHistPesagemMateriais = dataset;

				self.dsHistPesagemMateriais.setConditionalAutoSave(false);
				self.dsHistPesagemMateriais.addCriteriaProvider(getCriteriaHistPesagemMateriais);
				self.dsHistPesagemMateriais.addLineChangeListener(function () {
					atualizarTotais();
				});

				//diparado quando e atualizado registro pela Tela de pesagem por OP
				self.dsHistPesagemMateriais.addEventListener(DatasetEvents.ADD_RECORDS_AS_ARRAY_END, function () {
					atualizarTotais();

					self.dsHistPesagemMateriais.changeRow(0).then(function () {
						self.gridHistPesagemMateriais.refreshView();
					});

				});

				//diparado quando e atualizado registro pela Tela de pesagem por ID
				dataset.addDataSavedListener(function (isNew, records) {
					atualizarTotais();
				});

				dataset.init();
			}

			function interceptColumnMetadata(fieldMetadata, dataset) {
				if (dataset.getEntityName() == 'HistPesagemMateriais') {
					if (fieldMetadata.id.indexOf("AD_") != 0) {
						fieldMetadata.readOnly = true;

						if (["CODPROD", "CONTROLE", "NROLOTE", "NUAPO", "IDIPROC"].indexOf(fieldMetadata.id) > -1) {
							fieldMetadata.visible = false;
						}
					}
				}
			}

			function acceptField(fieldMetadata, dataset) {
				if (dataset.getEntityName() == 'HistPesagemMateriais') {
					if ("TIPO" == fieldMetadata.name) {
						fieldMetadata.isNullable = false;
						return true;
					} else if (fieldMetadata.name.indexOf("AD_") == 0) {
						return true;
					}
				}
				return false;
			}

			function eventBtnNovaOP() {
				saveEditModeRecord();

				if (verificaConfirmacaoApontamentoAutomatica(true)) {
					if (StringUtils.isEmpty(self.inputOP)) {
						return;
					}

					stopWebSocket();

					confirmApontamentoComAfter();
				} else {
					limparCamposTela();
				}
			}

			function limparCamposTela() {
				self.isVisibleAguardandoPeso = false;

				if (!verificaConfirmacaoApontamentoAutomatica()) {
					self.inputNroOP = undefined;
					self.inputIdVolume = undefined;
				}

				self.inputOP = "";
				self.inputAtividade = "";
				self.inputProduto = "";
				self.inputControle = "";
				self.inputLote = "";

				self.inputTamLote = 0;
				self.inputQtdPesada = 0;
				self.inputPesoNormal = 0;
				self.inputPesoPerda = 0;
				self.inputVolumeNormal = 0;
				self.inputVolumePerda = 0;
				self.inputSaldo = 0;

				self.dsHistPesagemMateriais.clearDataSet();

				setFocusInputMain();
			}

			function setFocusInputMain() {
				if (TELA_OP == self.resourceID) {
					document.getElementById("inputNroOP").focus();
				} else {
					document.getElementById("inputIdVolume").focus();
				}
			}

			function saveEditModeRecord() {
				if (self.dsHistPesagemMateriais.isEditMode()) {
					self.dsHistPesagemMateriais.save();
				}
			}

			function onDatasetProdutotCreated(dataset) {
				self.dsProduto = dataset;
				dataset.init();
			}

			function onDatagridLoaded(datagrid) {
				self.gridHistPesagemMateriais = datagrid;

				self.gridHistPesagemMateriais.setOrderColumn('ID', 'desc');
			};

			function saveConfig() {
				var chave = self.resourceID;

				var config = {
					staticFilter: {
						tipoBuscaPeso: self.tipoBuscaPeso,
						confirmacaoAuto: self.isConfirmacaoAuto,
						tipo: self.tipo,
						adicionais: _adicionaisValues
					}
				};

				SkApplicationInstance.saveMgeConfig(chave, config)
					.then(function () {
						SkApplicationInstance.putConfiguracaoTela(chave, config);
					});
			}

			function loadConfigFilter() {
				var config = SkApplicationInstance.getConfiguracaoTela(self.resourceID);

				if (config) {
					self.tipoBuscaPeso = config.staticFilter.tipoBuscaPeso;
					self.isConfirmacaoAuto = config.staticFilter.confirmacaoAuto;
					self.tipo = config.staticFilter.tipo == undefined ? "N" : config.staticFilter.tipo;
					_adicionaisValues = config.staticFilter.adicionais == undefined ? [] : config.staticFilter.adicionais;

					if (!angular.isArray(_adicionaisValues)) {
						let array = [];
						array.push(_adicionaisValues);
						_adicionaisValues = array;
					}
				} else {
					self.tipoBuscaPeso = TIPO_BUSCA_CONSTANTE;
					self.isConfirmacaoAuto = "S";
					self.tipo = "N";
				}
			}

			function cellFormatter(col, value, row) {
				if (angular.isDefined(value)) {
					return NumberUtils.format(value, self.DECQTD == undefined ? 2 : self.DECQTD > 20 ? 20 : self.DECQTD);
				}
			}

			function onDatasetHistPesagemMateriaisAddCreated(dataset) {
				self.dsHistPesagemMateriaisAdd = dataset;

				self.dsHistPesagemMateriaisAdd.setConditionalAutoSave(false);
				self.dsHistPesagemMateriaisAdd.addCriteriaProvider(getCriteriaHistPesagemMateriais);
				self.dsHistPesagemMateriaisAdd.addLineChangeListener(function (newIndex) {
					if (newIndex > -1) {
						self.dsHistPesagemMateriaisAdd.setFieldValue("TIPO", self.tipo);

						_camposAdicionais.forEach(function (field) {
							_adicionaisValues.forEach(function (fieldAdd) {
								if (field.name == fieldAdd.data) {
									self.dsHistPesagemMateriaisAdd.setFieldValue(fieldAdd.data, fieldAdd.value);
								}
							});
						});
					}
				});

				dataset.init();
				dataset.whenMetadataLoaded().then(function () {
					dataset.getFieldsMetadata().forEach(function (field) {
						if (field.isUserField) {
							_camposAdicionais.push({ name: field.name, dataType: field.dataType });
						}
					});

					self.dsHistPesagemMateriaisAdd.clearDataSet();
					self.dsHistPesagemMateriaisAdd.addRecordsAsObjects({ 'ID': 0 });
					self.dsHistPesagemMateriaisAdd.gotoRow(0);
				});
			}

			function atualizarTotais() {
				if (self.dsHistPesagemMateriais.size() > 0) {
					var records = self.dsHistPesagemMateriais.getRecordsAsObjects();
					var qtdPesadaTotal = 0;
					var qtdPesoTotalNormal = 0;
					var qtdPesoTotalPerda = 0;
					var contadorVolumeNormal = 0;
					var contadorVolumePerda = 0;

					var indexIdVolume = 0;

					for (var i = 0; i < records.length; i++) {
						if (!self.isTelaPesagemMateriaisOP && records[i].ID == _goRowIdVolume) {
							indexIdVolume = i;
						}

						qtdPesadaTotal += records[i].PESOLIQ == undefined ? 0 : records[i].PESOLIQ;

						if ("N" == records[i].TIPO) {
							//Tipo Normal
							qtdPesoTotalNormal += records[i].PESOLIQ == undefined ? 0 : records[i].PESOLIQ;
							contadorVolumeNormal++;
						} else {
							//Tipo Perda
							qtdPesoTotalPerda += records[i].PESOLIQ == undefined ? 0 : records[i].PESOLIQ;
							contadorVolumePerda++;
						}

					};

					qtdPesadaTotal += self.inputQtdApontada;

					self.inputQtdPesada = NumberUtils.format(qtdPesadaTotal, self.DECQTD);
					self.inputPesoNormal = NumberUtils.format(qtdPesoTotalNormal, self.DECQTD);
					self.inputPesoPerda = NumberUtils.format(qtdPesoTotalPerda, self.DECQTD);
					self.inputVolumeNormal = contadorVolumeNormal;
					self.inputVolumePerda = contadorVolumePerda;

					self.inputSaldo = NumberUtils.format(NumberUtils.stringToNumber(self.inputTamLote) - qtdPesadaTotal, self.DECQTD);

					if (!self.isTelaPesagemMateriaisOP) {
						if (indexIdVolume > 0) {
							self.dsHistPesagemMateriais.gotoRow(indexIdVolume);
						}

						setFocusInputMain();
					}

					self.isEnabledBtn = true;
				} else {
					self.inputPesoNormal = 0;
					self.inputPesoPerda = 0;
					self.inputVolumeNormal = 0;
					self.inputVolumePerda = 0;

					if (StringUtils.isNotEmpty(self.inputNroOP) || StringUtils.isNotEmpty(self.inputIdVolume)) {
						self.inputQtdPesada = NumberUtils.format(self.inputQtdApontada === undefined ? 0 : self.inputQtdApontada, self.DECQTD);
						self.inputSaldo = NumberUtils.format(NumberUtils.stringToNumber(self.inputTamLote) - NumberUtils.stringToNumber(self.inputQtdPesada), self.DECQTD);
					}

					self.isEnabledBtn = false;
				}
			}

			function verificaConfirmacaoApontamentoAutomatica(isEventoTela) {
				let input = self.isTelaPesagemMateriaisOP ? self.inputNroOP : self.inputIdVolume;
				let isInputsDiferentes = (self.inputTemp != input) || isEventoTela;
				let isExisteResgistrosGrade = self.dsHistPesagemMateriais.getRecordsAsObjects().length > 0;
				let isConfirmacaoAuto = self.isConfirmacaoAuto == undefined || self.isConfirmacaoAuto == "S";

				if (!self.isTelaPesagemMateriaisOP && ((self.inputPesoNormal == 0 && self.inputPesoPerda == 0) || StringUtils.isEmpty(self.inputIdVolume))) {
					return false;
				} else if (isInputsDiferentes && isExisteResgistrosGrade && isConfirmacaoAuto) {
					return true;
				}

				return false;
			}

			function afterConfirmaApontamentoChangeVolme() {
				startWebSocket();
				if (!self.isTelaPesagemMateriaisOP) {
					self.inputPesoNormal = 0;
					self.inputPesoPerda = 0;
					setFocusInputMain();
				}

				eventBtnSelecinaOPandIDvolume();
			}

			function buscaApontamentosBaseExclusao() {
				var copyRecordsSelected = self.dsHistPesagemMateriais.getRecordsAsObjects();
				return CrudUtils.find('HistPesagemMateriais', 'ID,PESOBRUTO,PESOLIQ,TIPO', undefined, false, 'ID IN (' + getRecordsAsString(copyRecordsSelected) + ')');
			}

			function buscaApontamentosBaseInclusao() {
				return CrudUtils.find('HistPesagemMateriais', 'ID,PESOBRUTO,PESOLIQ,TIPO', undefined, false, "IDIPROC = " + self.inputOP + " AND NUAPO IS NULL AND CODPROD = " + self.CODPROD + " AND CONTROLE = '" + self.inputControle + "'");
			}

			function validaDivergenciaExclusao(apontamentosBase) {
				var copyRecordsSelected = self.dsHistPesagemMateriais.getRecordsAsObjects();

				if (!ObjectUtils.isEmpty(apontamentosBase)) {
					_divergenciaApontamento = angular.isDefined(apontamentosBase.find(apontamentoBase => {
						let apontamentoTela = copyRecordsSelected.find(apontamento => apontamento.ID == apontamentoBase.ID);

						if (self.isTelaPesagemMateriaisOP) {
							for (var i = 0; i < copyRecordsSelected.length; i++) {
								if (!apontamentosBase.find(apontamento => apontamento.ID == copyRecordsSelected[i].ID)) {
									return true;
								}
							}
						} else {
							if (angular.isDefined(apontamentoTela)) {
								apontamentoTela.PESOBRUTO = apontamentoTela.PESOBRUTO == "" ? undefined : apontamentoTela.PESOBRUTO;
								apontamentoTela.PESOLIQ = apontamentoTela.PESOLIQ == "" ? undefined : apontamentoTela.PESOLIQ;
								apontamentoBase.PESOBRUTO = apontamentoBase.PESOBRUTO == "" ? undefined : apontamentoBase.PESOBRUTO;
								apontamentoBase.PESOLIQ = apontamentoBase.PESOLIQ == "" ? undefined : apontamentoBase.PESOLIQ;
							}
							if ((apontamentoBase.PESOBRUTO != apontamentoTela.PESOBRUTO)
								&& (apontamentoBase.PESOLIQ != apontamentoTela.PESOLIQ)) {
								return true;
							}
						}
						return false;
					})) ? true : false;
				} else {
					_divergenciaApontamento = true;
				}
			}

			function validaDivergenciaInclusao(apontamentosBase) {
				var copyRecordsSelected = self.dsHistPesagemMateriais.getRecordsAsObjects();

				if (!ObjectUtils.isEmpty(apontamentosBase)) {
					_divergenciaApontamento = angular.isDefined(apontamentosBase.find(apontamentoBase => {
						let apontamentoTela = copyRecordsSelected.find(apontamento => apontamento.ID == apontamentoBase.ID);
						if (self.isTelaPesagemMateriaisOP && angular.isUndefined(apontamentoTela)) {
							return true;
						} else {
							if (angular.isDefined(apontamentoTela)) {
								apontamentoTela.PESOBRUTO = apontamentoTela.PESOBRUTO == "" ? undefined : apontamentoTela.PESOBRUTO;
								apontamentoTela.PESOLIQ = apontamentoTela.PESOLIQ == "" ? undefined : apontamentoTela.PESOLIQ;
								apontamentoBase.PESOBRUTO = apontamentoBase.PESOBRUTO == "" ? undefined : apontamentoBase.PESOBRUTO;
								apontamentoBase.PESOLIQ = apontamentoBase.PESOLIQ == "" ? undefined : apontamentoBase.PESOLIQ;
							}

							if (
								(apontamentoBase.PESOBRUTO != apontamentoTela.PESOBRUTO)
								&& (apontamentoBase.PESOLIQ != apontamentoTela.PESOLIQ)) {
								return true;
							}
						}
						return false;
					})) ? true : false;
				} else {
					_divergenciaApontamento = true;
				}
			}

			function getRecordsAsString(copyRecordsSelected) {
				let stringRecords = '';
				copyRecordsSelected.forEach(apontamento => {
					if (copyRecordsSelected.indexOf(apontamento) == copyRecordsSelected.length - 1) {
						stringRecords += apontamento.ID;
					} else {
						stringRecords += apontamento.ID + ',';
					}
				});

				return stringRecords;
			}
		}]);
