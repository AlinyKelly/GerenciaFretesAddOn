package br.com.gerenciafretes.addon.exemplos.jobs;

import br.com.sankhya.modelcore.MGEModelException;
import br.com.sankhya.modelcore.util.BaseSPBean;

import javax.ejb.SessionBean;
/*

        ? obrigat?rio seguir o padr?o abaixo para criar Jobs (Rotinas automatizadas executadas de tempos em tempos):

        A documenta??o ? OBRIGAT?RIA!!!!!! Sem ela, o xdoclet n?o conseguir? gerar suas interfaces e o servi?o nunca ser? encontrado.

        1 - Nome da classe sempre termina com *SPBean.
        2 - @ejb.bean - Sempre ser? o Nome da classe, mas termina somente com *SP.
        3 - jndi-name - Sempre ser? o caminho completo para a classe, cujo nome seguir? o padr?o acima, e sempre ser? separado por "/".
        4 - type - Recomendado ? stateless, caso deseje outro, consulte documenta??o.
        5 - transaction-type - Recomendado ? "Container". Caso deseje outro, consulte documenta??o.
        6 - view-type - Sempre ser? "local".
        7 - @ejb.transaction - Recomendado ? "Supports". Caso deseje outro, consulte documenta??o.
        8 - @ejb.util - Recomendado ? false. Caso deseje outro, consulte documenta??o.


        IMPORTANTE: ? necess?rio tamb?m editar o arquivo 'mgeschedule.xml'. Este arquivo est? em model/resources/META-INF/mgeschedule.xml.
        Todo servi?o novo jbo deve ser declarado neste arquivo, caso contr?rio, este n?o ser? executado.

* */


/**
 * @ejb.bean name="ExemploJobSP"
 * jndi-name="br/com/fabricante/addon/exemplos/jobs/ExemploJobSP"
 * type="Stateless"
 * transaction-type="Container"
 * view-type="local"
 * @ejb.transaction type="Supports"
 * @ejb.util generate="false"
 */
public class ExemploJobSPBean extends BaseSPBean implements SessionBean {

    /*
        ? OBRIGAT?RIO criar o m?todo getScheduleConfig. Este m?todo sempre ir? retornar uma String contendo o intervalo das execu??es.

        O intervalo dever? ser retornado em milisegundos. Ex: 1 segundo s?o 1000 milisegundos. 1 hora s?o 3600000 milisegundos.

        A documenta??o ? OBRIGAT?RIA!!!

        1 - @ejb.interface-method - Sempre ser? "local".
    * */

    /**
     * @ejb.interface-method view-type = "local"
     */
    public String getScheduleConfig() throws java.lang.Exception {
        return "&1000";
    }


      /*
        ? OBRIGAT?RIO criar o m?todo onSchedule. Este ? o m?todo onde a rotina ser? executada.

        A documenta??o ? OBRIGAT?RIA!!!

        1 - @ejb.interface-method
        2 - @ejb.transaction - Recomendado ? "Supports". Caso deseje outro, consulte documenta??o.
    * */

    /**
     * @ejb.interface-method
     * @ejb.transaction type="Supports"
     */
    public void onSchedule() throws Exception, MGEModelException {
        System.out.println("Job Local foi chamado.");
    }
}
