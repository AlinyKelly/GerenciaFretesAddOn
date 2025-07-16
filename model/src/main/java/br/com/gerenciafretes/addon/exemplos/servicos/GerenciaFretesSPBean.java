package br.com.gerenciafretes.addon.exemplos.servicos;

import br.com.sankhya.jape.core.JapeSession;
import br.com.sankhya.jape.vo.DynamicVO;
import br.com.sankhya.jape.vo.VOProperty;
import br.com.sankhya.jape.wrapper.JapeFactory;
import br.com.sankhya.jape.wrapper.JapeWrapper;
import br.com.sankhya.jape.wrapper.fluid.FluidCreateVO;
import br.com.sankhya.modelcore.MGEModelException;
import br.com.sankhya.modelcore.util.BaseSPBean;
import br.com.sankhya.modelcore.util.MGECoreParameter;
import br.com.sankhya.ws.ServiceContext;
import com.google.gson.JsonObject;

import javax.ejb.SessionBean;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Iterator;
/*

        � obrigat�rio seguir o padr�o abaixo para criar Servi�os (similares � endpoints):

        A documenta��o � OBRIGAT�RIA!!!!!! Sem ela, o xdoclet n�o conseguir� gerar suas interfaces e o servi�o nunca ser� encontrado.

        1 - Nome da classe sempre termina com *SPBean.
        2 - @ejb.bean sempre ser� o Nome da classe, mas termina somente com *SP.
        3 - jndi-name sempre ser� o caminho completo para a classe, cujo nome seguir� o padr�o acima, e sempre ser� separado por "/".
        4 - type - Recomendado � stateless, caso deseje outro, consulte documenta��o.
        5 - transaction-type - Recomendado � "Container". Caso deseje outro, consulpe documenta��o.
        6 - view-type - Sempre ser� "remote".
        7 - @ejb.transaction - Recomendado � "Supports". Caso deseje outro, consulte documenta��o.
        8 - @ejb.util - Recomendado � false. Caso deseje outro, consulte documenta��o.


        IMPORTANTE: � necess�rio tamb�m editar o arquivo 'service-providers.xml'. Este arquivo est� em vc/src/main/WEB-INF/resources/service-providers.xml.
        Todo servi�o novo deve ser declarado neste arquivo, caso contr�rio, este n�o ser� localizado em tempo de execu��o.
 */


/**
 * @ejb.bean name="GerenciaFretesSP"
 * jndi-name="br/com/gerenciafretes/addon/exemplos/servicos/GerenciaFretesSP"
 * type="Stateless"
 * transaction-type="Container"
 * view-type="remote"
 * @ejb.transaction type="Supports"
 * @ejb.util generate="false"
 */
public class GerenciaFretesSPBean extends BaseSPBean implements SessionBean {

    /*
            A cria��o de um m�todo que ser� chamado (equivalente � um endpoint) deve seguir o padr�o abaixo.

            A documenta��o � OBRIGAT�RIA!!! Sem ela, o xdoclet n�o conseguir� gerar suas interfaces e este m�todo n�o ser� encontrado.

            1 - @ejb.interface-method - Sempre ser� "remote".
            2 - O par�metro br.com.sankhya.ws.ServiceContext � OBRIGAT�RIO. Esta � a assinatura padr�o do m�todo. Ex: public void meuMetodo(br.com.sankhya.ws.ServiceContext ctx) {...}

            Importante: O m�todo abaixo ser� chamado com URL/nome_projeto/service.sbr?serviceName=ExemploServicoSP.getAlgumaInfo, onde
            nome_projeto � o valor de 'rootProject.name' que est� no arquivo 'settings.gradle'.

    */

    /**
     * @throws MGEModelException
     * @ejb.interface-method tview-type="remote"
     * @ejb.transaction type="Required"
     */
    public void inserirFrete(ServiceContext ctx) throws MGEModelException {
        JsonObject response = new JsonObject();

        JapeSession.SessionHandle hnd = null;

        try {
            hnd = JapeSession.open();

            JapeWrapper gerenciaFretesDetDAO = JapeFactory.dao("GerenciaFretesDet");

            BigDecimal vlrFrete = (BigDecimal) MGECoreParameter
                .getParameter("akfs.:gerenciafretes","addon.mascara.GERVLRFRETE");

            JsonObject req = ctx.getJsonRequestBody();
            BigDecimal idpai = req.get("IDPAI").getAsBigDecimal();

            DynamicVO newVO = gerenciaFretesDetDAO.create()
                .set("IDPAI", idpai)
                .set("VALOR", vlrFrete)
                .set("DESCRICAO", "Financeiro teste inserido")
                .save();

            response.addProperty("response", "Registro: " +
                newVO.asBigDecimal("ID") + " inserido com sucesso!");
        } catch (Exception e) {
            e.printStackTrace();
            response.addProperty("response", "Erro ao inserir: " + e.getMessage());
        } finally {
            JapeSession.close(hnd);
        }


        ctx.setJsonResponse(response);
    }

    /**
     * @throws MGEModelException
     * @ejb.interface-method tview-type="remote"
     * @ejb.transaction type="Required"
     */
    public void dividirValor(ServiceContext ctx) throws MGEModelException {
        JsonObject response = new JsonObject();

        JapeSession.SessionHandle hnd = null;

        try {
            hnd = JapeSession.open();

            JapeWrapper gerenciaFretesDetDAO = JapeFactory.dao("GerenciaFretesDet");

            JsonObject req = ctx.getJsonRequestBody();
            BigDecimal id = req.get("ID").getAsBigDecimal();
            BigDecimal idpai = req.get("IDPAI").getAsBigDecimal();
            BigDecimal valor = req.get("VALOR").getAsBigDecimal();

            gerenciaFretesDetDAO.prepareToUpdateByPK(id,idpai)
                .set("VALOR", valor.divide(new BigDecimal(2), RoundingMode.HALF_DOWN)).update();

            response.addProperty("response", "Registro : " +
                id + " dividido com sucesso!");
        } catch (Exception e) {
            e.printStackTrace();
            response.addProperty("response", "Erro ao dividir: " + e.getMessage());
        } finally {
            JapeSession.close(hnd);
        }


        ctx.setJsonResponse(response);
    }

    /**
     * @throws MGEModelException
     * @ejb.interface-method tview-type="remote"
     * @ejb.transaction type="Required"
     */
    public void duplicarFrete(ServiceContext ctx) throws MGEModelException {
        JsonObject response = new JsonObject();

        JapeSession.SessionHandle hnd = null;

        try {
            hnd = JapeSession.open();

            JapeWrapper gerenciaFretesDetDAO = JapeFactory.dao("GerenciaFretesDet");

            JsonObject req = ctx.getJsonRequestBody();
            BigDecimal id = req.get("ID").getAsBigDecimal();
            BigDecimal idpai = req.get("IDPAI").getAsBigDecimal();

            DynamicVO vo = gerenciaFretesDetDAO.findByPK(id, idpai);
            vo.setProperty("ID", null);

            DynamicVO newVO = duplicar(vo, "GerenciaFretesDet");

            response.addProperty("response", "Registro : " +
                id + " foi duplicado para o registro " + newVO.asBigDecimal("ID") + " com sucesso!");
        } catch (Exception e) {
            e.printStackTrace();
            response.addProperty("response", "Erro ao duplicar: " + e.getMessage());
        } finally {
            JapeSession.close(hnd);
        }


        ctx.setJsonResponse(response);
    }

    private static DynamicVO duplicar(DynamicVO modeloVO, String dao) throws Exception {
        try {
            JapeWrapper japeDao = JapeFactory.dao(dao);
            FluidCreateVO fluidCreateVO = japeDao.create();
            Iterator<VOProperty> iterator = modeloVO.iterator();

            while (iterator.hasNext()) {
                VOProperty property = iterator.next();
                fluidCreateVO.set(property.getName(), property.getValue());
            }

            DynamicVO saved = fluidCreateVO.save();

            return saved;
        } catch (Exception e) {
            e.printStackTrace();
            throw new Exception(e);
        }
    }
}
