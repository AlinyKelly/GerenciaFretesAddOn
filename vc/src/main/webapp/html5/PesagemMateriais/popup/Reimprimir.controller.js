angular
    .module('PesagemMateriaisApp')
    .controller('ReimprimirController',['$scope','data','$popupInstance','MessageUtils','i18n', 'SkApplicationInstance','ObjectUtils', 'NumberUtils',
        function ($scope, data, $popupInstance,MessageUtils, i18n, SkApplicationInstance, ObjectUtils, NumberUtils) {
            var self = this;

            init();

            function init() {
                self.idInicial = data.idInicial;
                self.idFinal = data.idFinal;

                $scope.$success = function() {
                    confirmar();
                }
            }

            function confirmar() {
                var result = {idInicial: self.idInicial,
                              idFinal: self.idFinal
                             };
                $popupInstance.success(result);
            }

            $scope.runScript = function(keyEvent) {
                if (keyEvent.which === 13){
                    confirmar();
                }
            }
        }]);
