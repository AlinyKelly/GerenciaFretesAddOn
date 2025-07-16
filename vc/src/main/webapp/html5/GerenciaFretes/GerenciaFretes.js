angular.module('GerenciaFretesApp', ['snk']).controller('GerenciaFretesController', ['SkApplication', 'i18n', 'ObjectUtils', 'MGEParameters', 'AngularUtil', 'StringUtils', 'ServiceProxy', 'MessageUtils', 'SanPopup',
   function (SkApplication, i18n, ObjectUtils, MGEParameters, AngularUtil, StringUtils, ServiceProxy, MessageUtils, SanPopup) {
      var self = this;
      var _dsGerenciaFretes;
      var _dynaformGerenciaFretes;
      var _dsGerenciaFretesDt;
      var _dynaformGerenciaFretesDt;
      var _personalizedFilter;
      var _navigator;
      //Dynaform Interceptors
      self.onDynaformLoaded = onDynaformLoaded;
      self.customTabsLoader = customTabsLoader;
      self.interceptNavigator = interceptNavigator;
      self.interceptPersonalizedFilter = interceptPersonalizedFilter;
      self.buttonAction = buttonAction;
      self.inserirFrete = inserirFrete;
      self.dividirValor = dividirValor;
      self.duplicarFrete = duplicarFrete;
      //Dynaform intercepttors implementation
      ObjectUtils.implements(self, IDynaformInterceptor);
      self.interceptDynaform = interceptDynaform;
      //{declaration interceptors dynaform placeholder}            
      //Dataset Interceptors
      ObjectUtils.implements(self, IDataSetObserver);
      self.dataSaved = dataSaved;
      self.insertionModeActivated = insertionModeActivated;
      self.currentLineChanged = currentLineChanged;
      self.refreshed = refreshed;
      self.closed = closed;
      self.recordRemoved = recordRemoved;
      self.dataModified = dataModified;
      self.editionCanceled = editionCanceled;
      self.selectionChanged = selectionChanged;
      self.editionModeActivated = editionModeActivated;
      self.saveAvoided = saveAvoided;
      self.allEvents = allEvents;
      self.uploadingFile = uploadingFile;
      self.cleared = cleared;
      //{declaration interceptors dataset placeholder}           
      function onDynaformLoaded(dynaform, dataset) {

         if (dataset.getEntityName() == 'GerenciaFretes') {
            _dynaformGerenciaFretes = dynaform;
            _dsGerenciaFretes = dataset;
         }

         if (dataset.getEntityName() == 'GerenciaFretesDet') {
            _dynaformGerenciaFretesDt = dynaform;
            _dsGerenciaFretesDt = dataset;

            _dynaformGerenciaFretesDt.getNavigatorAPI()
               .showAddButton(false)
               .showSaveButton(false)
               .showCopyButton(false);
         }
      }

      function customTabsLoader(entityName) {
         if (entityName == 'GerenciaFretes') {
            var customTabs = [];
            //{customTabs placeholder}
            return customTabs;
         }
      }

      function interceptPersonalizedFilter(personalizedFilter, dataset) {
         _personalizedFilter = personalizedFilter;
      }

      function interceptNavigator(navigator, dynaform) {
         _navigator = navigator;
      }

      function buttonAction() {
         alert('Botão de inserir frete!');
      }

      function inserirFrete() {
         var param = { "IDPAI": _dsGerenciaFretes.getFieldValue('ID') };

         ServiceProxy.callService('gerenciafretes@GerenciaFretesSP.inserirFrete', param)
            .then(function (response) {
               var mensagem = ObjectUtils.getProperty(response, 'responseBody.response');
               MessageUtils.showInfo('Aviso', mensagem);
               _dsGerenciaFretesDt.refresh();
            })
      }

      function dividirValor() {
         var param = {
            "IDPAI": _dsGerenciaFretes.getFieldValue('ID'),
            "ID": _dsGerenciaFretesDt.getFieldValue('ID'),
            "VALOR": _dsGerenciaFretesDt.getFieldValue('VALOR')
         };

         ServiceProxy.callService('gerenciafretes@GerenciaFretesSP.dividirValor', param)
            .then(function (response) {
               var mensagem = ObjectUtils.getProperty(response, 'responseBody.response');
               MessageUtils.showInfo('Aviso', mensagem);
               _dsGerenciaFretesDt.refresh();
            })
      }

      function duplicarFrete() {
         var param = {
            "IDPAI": _dsGerenciaFretes.getFieldValue('ID'),
            "ID": _dsGerenciaFretesDt.getFieldValue('ID')
         };

         ServiceProxy.callService('gerenciafretes@GerenciaFretesSP.duplicarFrete', param)
            .then(function (response) {
               var mensagem = ObjectUtils.getProperty(response, 'responseBody.response');
               MessageUtils.showInfo('Aviso', mensagem);
               _dsGerenciaFretesDt.refresh();
            })
      }

      function interceptDynaform(dynaform) { }
      //{implementation interceptors dynaform placeholder}
      //Dataset interceptors implementation
      function dataSaved(isNew, records) { }

      function insertionModeActivated() { }

      function currentLineChanged(newIndex) { }

      function refreshed() { }

      function closed() { }

      function recordRemoved(record) { }

      function dataModified(fieldName) { }

      function editionCanceled() { }

      function selectionChanged() { }

      function editionModeActivated() { }

      function saveAvoided(nullFieldNames) { }

      function allEvents(event, parameters) { }

      function uploadingFile(uploading) { }

      function cleared() { }
      //{implementation interceptors dataset placeholder}
      //{popup callers placeholder}           
   }
]);
