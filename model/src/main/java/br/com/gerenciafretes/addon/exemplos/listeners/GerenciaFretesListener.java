package br.com.gerenciafretes.addon.exemplos.listeners;

import br.com.sankhya.jape.event.PersistenceEvent;
import br.com.sankhya.jape.event.PersistenceEventAdapter;
import br.com.sankhya.jape.vo.DynamicVO;
import br.com.sankhya.jape.wrapper.JapeFactory;
import br.com.sankhya.jape.wrapper.JapeWrapper;
import com.sankhya.util.TimeUtils;

/*
  Este exemplo extende de PersitenceEventAdapter.

  Para que este listener seja funcional, � OBRIGAT�RIO criar o arquivo 'extension-listeners.xml', que fica no caminho model/resources/META-INF/extension-listeners.xml

* */
public class GerenciaFretesListener extends PersistenceEventAdapter {

    /*
        Sobrescrever os eventos desejados e implementar sua funcionalidade.
        Em caso de d�vidas, consulte certifica��o de desenvolvimento de extens�es.
    * */
    @Override
    public void beforeInsert(PersistenceEvent event) throws Exception {

        DynamicVO newRegistro = (DynamicVO) event.getVo();

        newRegistro.setProperty("DTALTER", TimeUtils.getNow());
        newRegistro.setProperty("ATIVO", "S");

        JapeWrapper parceiroDAO = JapeFactory.dao("Parceiro");
        if (newRegistro.asBigDecimal("CODPARC") != null) {
            String nomeparc = parceiroDAO.findByPK(newRegistro.asBigDecimal("CODPARC")).asString("NOMEPARC");
            newRegistro.setProperty("NOME", nomeparc);
        }

    }

    @Override
    public void beforeUpdate(PersistenceEvent event) throws Exception {
        DynamicVO newRegistro = (DynamicVO) event.getVo();
        DynamicVO oldRegistro = (DynamicVO) event.getOldVO();

        newRegistro.setProperty("DTALTER", TimeUtils.getNow());

        if (!newRegistro.asString("ATIVO").equals(oldRegistro.asString("ATIVO"))) {
            String log = "O campo Ativo foi alterado de " + oldRegistro.asString("ATIVO") + " para " + newRegistro.asString("ATIVO");
            newRegistro.setProperty("OBSERVACAO", log.toCharArray());
        }
    }
}
