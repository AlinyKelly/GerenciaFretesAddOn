angular
    .module('PesagemMateriaisApp')
    .controller('ConfiguracoesController',['$scope','data','$popupInstance','MessageUtils','i18n', 'SkApplicationInstance','ObjectUtils', 'NumberUtils',
        function ($scope, data, $popupInstance,MessageUtils, i18n, SkApplicationInstance, ObjectUtils, NumberUtils) {
            var self = this;

            self.optionsBuscaPeso = [{ data: 'C', value: i18n('Producao.PesagemMateriais.cbBuscaConstante') },
                                    { data: 'S', value: i18n('Producao.PesagemMateriais.cbBuscaSolicitar') }];

            init();

            function init() {
                if (data) {
                    self.cbBuscaPeso = data.tipoBuscaPeso;
                    self.chkConfirmacaoAuto = data.confirmacaoAuto;
                    self.helpTipConfirmaAuto = data.isTelaPesagemMateriaisOP ? i18n('Producao.PesagemMateriais.helpTipoConfirmaAutoOP') : i18n('Producao.PesagemMateriais.helpTipoConfirmaAutoID');
                } else {
                    self.cbBuscaPeso = 'C';
                    self.chkConfirmacaoAuto = true;
                }

                $scope.$success = function() {
                    confirmar();
                }
            }

            function confirmar() {
                var result = {tipoBuscaPeso: self.cbBuscaPeso, confirmacaoAuto: self.chkConfirmacaoAuto};
                $popupInstance.success(result);
            }

            $scope.runScript = function(keyEvent) {
                if (keyEvent.which === 13){
                    confirmar();
                }
            }
        }]);
