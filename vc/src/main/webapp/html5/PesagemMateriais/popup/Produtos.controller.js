angular
    .module('PesagemMateriaisApp')
    .controller('ProdutoController',['GridConfig','$scope','data','$popupInstance','MessageUtils','i18n', 'SkApplicationInstance','ObjectUtils', 'AngularUtil',
        function (GridConfig, $scope, data, $popupInstance,MessageUtils, i18n, SkApplicationInstance, ObjectUtils, AngularUtil) {
            var self = this;
            ObjectUtils.implements(self, IDatagridInterceptor);

            self.resourceID = SkApplicationInstance.getResourceID();
            self.gridProdutoConfig = self.resourceID + '.GridProduto';
            self.onDatagridLoaded = onDatagridLoaded;

            self.ondoubleClick = ondoubleClick;

            init();

            function init() {
                GridConfig.registerGridConfig(self.gridProdutoConfig, self.gridProdutoConfig, undefined, true);
                self.dsProduto = angular.copy(data.dsProduto);

                if (self.dsProduto && self.gridProduto) {
                    self.dsProduto.gotoRow(0).then(self.gridProduto.setFocus);
                }
            }

            function ondoubleClick() {
                $popupInstance.success(self.dsProduto.getCurrentIndex());
            };

            function onDatagridLoaded(datagrid) {
                self.gridProduto = datagrid;

                if (self.dsProduto && self.gridProduto) {
                    self.dsProduto.gotoRow(0)
                    .then(function () {
                        AngularUtil.timeout(function() {
                            self.gridProduto.setFocus();
                        }, 500);
					});
                }
            };
        }]);
