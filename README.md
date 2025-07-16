<div align="center">
<h1>
  Template Addon
</h1><br/>


</div>  


# Objetivo
Para aumentar a consistência e a eficiência na construção de um add-on, este template foi desenvolvido com uma estrutura pré-configurada que simplifica os processos iniciais de desenvolvimento. Além disso, com algumas configurações adicionais, é possível automatizar a distribuição do add-on no Sankhya Place.

# Requisitos

- Servidor de aplicação e banco de dados Sankhya - [SDK](https://downloads.sankhya.com.br/downloads?app=SDK)
- [Java 1.8](https://www.java.com/pt-BR/download/)
- IDE para desenvolvimento de projetos em Java - Recomendamos o uso do [Intellij](https://www.jetbrains.com/idea/download)
- [Gradle](https://gradle.org/install/) - Se estiver utilizando o IntelliJ, não será necessário fazer o download do Gradle, pois ele já vem integrado à IDE.
- Ser [registrado na base de desenvolvedores](https://www.sankhya.com.br/developers/) Sankhya.

##### **Requisitos computacionais**

- **Processador**: Intel Core i5 ou superior.
  - Processadores equivalentes AMD Ryzen também são adequados.
- **Memória RAM**: 16 GB ou mais.
- **Armazenamento**: SSD de no mínimo 120 GB.


# 1. Ambiente de desenvolvimento

## 1.1 Servidor de aplicação e banco de dados Sankhya

Para preparar o ambiente de desenvolvimento, faça o download do projeto modelo através do [Link](https://sankhyadist.s3.sa-east-1.amazonaws.com/addon-template.zip), se preferir você pode seguir com o desenvolvimento do seu add-on utilizando o seu ambiente de teste da aplicação Sankhya.

Obs.: Caso não tenha acesso ao Sankhya ID realize o cadastro da sua empresa como desenvolvedora para seguir. [Saiba mais](https://developer.sankhya.com.br/docs/como-participar-do-ecossistema-de-desenvolvimento-sankhya).

### 1.1.1. Inicialização do banco de dados Oracle e SQL <br><br>

##### Preservando a base de desenvolvimento

Para garantir a preservação dos dados da sua base de desenvolvimento, crie um volume antes de executar o container. Use o comando:<br>

Oracle
```bash
docker volume create skdev-oracle-volume
```

SQL
```bash
docker volume create mssql_dados
```

Após a criação do volume é necessário inicar o container, para isso execute o comando abaixo:<br>

Oracle

```bash
docker run -d --name skdev-oracle --shm-size=1g -p 1521:1521 -p 5500:5500 -v skdev-oracle-volume:/opt/oracle/oradata sankhyaimages/skdev-oracle:1.0.0
```

SQL

```bash
docker run -d --name sankhya_sqlserver -p 1433:1433 -v mssql_dados:/var/opt/mssql sankhyaimages/skdev-mssql:1.0.0
```

A primeira vez que o container rodar uma série de configurações serão feitas na base de dados, inclusive a importação do dump. Levará de 20 a 30 minutos...
Execute o comando abaixo para verificar o log de configuração:

Oracle

```bash
docker logs -f skdev-oracle
```

SQL

```bash
docker logs -f mssql_dados
```

Após finalizar toda a configuração, acesse o docker e verifique que seu container está em execução.


##### Conectando na base de dados 

Oracle 

Para conectar na base de dados Oracle, basta utilizar os seguintes dados de conexão:

- **Endereço:** `127.0.0.1`
- **Porta:** `1521`
- **SID:** `XE`
- **Usuário:** `SKCONTAINER`
- **Senha:** `tecsis`

SQL

Para conectar na base de dados SQL, basta utilizar os seguintes dados de conexão:

- **URL**: [`localhost`](http://localhost)
- **Porta**: `1433`
- **Banco**: `jiva`
- **Usuário**: `sankhya`
- **Senha**: `@Sankhya`

##### Parando e reiniciando o container docker

Para interromper o ambiente de desenvolvimento, execute:<br>

Oracle
```bash
docker stop skdev-oracle
```

SQL 
```bash
docker stop sankhya_sqlserver
```

Para reiniciar o ambiente, utilize: <br>

Oracle
```bash
docker start skdev-oracle
```

SLQ
```bash
docker start sankhya_sqlserver
```
---

### 1.1.2 Servidor de aplicação

Após inicializar o banco de dados, é necessário instalar e iniciar o servidor de aplicação. Para isso, acesse a [Central de Downloads Sankhya](https://downloads.sankhya.com.br/downloads?app=WildFly&c=1) e faça o download do WildFly 23.0 e realize os seguintes comandos de acordo com o seu sistema operacional:

Windows
```bash
C:\wildfly_8180\bin\standalone.bat
```

Onde C:\wildfly_8180 é o caminho onde o wildfly está instalado.

Linux
```bash
/home/mgeweb/wildfly_producao/bin/./standalone.sh
```

Onde /home/mgeweb/wildfly_producao é o caminho onde o wildfly está instalado.

**Siga as instruções detalhadas nos manuais abaixo:**
- [Manual de Instalação do Sankhya OM em Ambiente Linux](https://ajuda.sankhya.com.br/hc/pt-br/articles/360045547894-Manual-de-Instala%C3%A7%C3%A3o-Sankhya-Om-em-Ambiente-Linux#Configura%C3%A7%C3%A3odoWildfly)
- [Manual de Instalação do Sankhya OM em Ambiente Windows](https://ajuda.sankhya.com.br/hc/pt-br/articles/360045695134-Manual-de-Instala%C3%A7%C3%A3o-Sankhya-Om-em-Ambiente-Windows)

**Para habilitar o modo debug efetue os seguintes passos:**
1. Acesse a pasta do WildFly: `wildfly\bin`.
2. Edite o arquivo **`standalone.conf.bat`** (no Windows) ou edite o arquivo **`standalone.conf`** (no Linux).
3. Remova o comentário do seguinte argumento:
```bash
# Sample JPDA settings for remote socket debugging  
JAVA_OPTS="$JAVA_OPTS -agentlib:jdwp=transport=dt_socket,address=8787,server=y,suspend=n"
``` 
Após finalizar a configuração do wildfly, acesse o WPM: http://localhost:8080/wpm, para efetuar a instalação de uma versão do Sankhya Om.

# 2. Configurações do add-on studio

## 2.1. Configurações do arquivo settings.gradle

Altere os valores conforme o exemplo baixo, para configurar o nome do projeto e os módulos.
```groovy
rootProject.name = 'addonexemplo'
include 'model'
include 'vc'
```
## 2.2 Configurações do arquivo build.gradle
Configure os seguintes itens conforme especificado abaixo no arquivo build.gradle:
- **group**<br> Por convenção utiliza-se o seu domínio ao contrário seguido do nome da aplicação, conforme exemplo abaixo:
  ```groovy
  group = 'br.com.gerenciafretes.addonexemplo'
  ```
- **snkmodule**
  ```groovy
  snkmodule  {
     serverFolder = '${wildfly.home}' // /home/user/wildfly/
     plataformaMinima = "4.28"
  }
  ```
  - **serverFolder**: Pasta onde está configurado o servidor wildfly. Sugerido variável de ambiente,
    para não causar conflito entre ambientes que utilizem diferentes SO's. Abaixo seguem alguns guias para a configuração do servidor Wildfly em ambiente local.
  - **plataformaMinima**: Versão do Sankhya Om mínima suportada, sugerido 4.28 e acima.

- **addon**
<br>Caso esteja utilizando o template baixado via Área do Desenvolvedor, pule para a etapa de [Gestão de dependências](#3-gestão-de-dependências).
  ```groovy 
  addon {
      appKey="APP_KEY_INFORMADA"
      parceiroNome ="NOME_EMPRESA"
  }
  ```
  - Guia de como obter [Appkey](https://developer.sankhya.com.br/reference/obter-appkey).
  - **Importante**: O campo "appKey" é obrigatório para a geração do Addon.

# 3. Gestão de dependências
O gradle já inclui as seguintes dependências por padrão.
- model:
  - mge-modelcore
  - jape
  - sanutil
  - sanws
  - dwf
  - mge-param
  - gson-2.1
  - commons-httpclient-3.0.1-snk
  - jdom
  - wildfly-spec-api
- vc:
  - dwf
  - gson-2.1
  - sanws
  - jape
  - sanutil
  - sanmodule
  - servlet-api
  - wildfly-spec-api
  - commons-httpclient-3.0.1-snk

Para utilizar novas dependências fornecidas pelo Sankhya Om, use a diretiva implementation. Para adicionar novas
bibliotecas ao addon, use a diretiva moduleLib. O Gradle importa bibliotecas de forma hierárquica, conforme
especificado no POM ou no módulo. Revise as bibliotecas para manter o addon o mais enxuto possível.


As dependências e bibliotecas podem ser alteradas no arquivo build.gradle dentro dos módulos "model" e "vc" do projeto.

```groovy
dependencies{
   //Sistema irá remover essa dependencia do SkOm e incluir ela no addon, dessa forma pode-se usar uma versão diferente da do monolito
    moduleLib('br.com.sankhya:skw-environment:1.8.2')
   
   //Não será adicionado no addon e usará a lib do monolito
    implementation('br.com.sankhya:bsh-1.3.0:master') 
}

```

# 4. Scripts/migrations
Os scripts de migração são responsáveis pela criação e alteração de tabelas, campos e outros objetos no banco de dados. Eles também são usados para realizar atualizações nas estruturas existentes.

#### Cuidados
1) Alterações em tabelas com alto volume de transações e que suportam processos críticos devem ser feitas com extrema cautela. Mudanças nesses cenários podem afetar a performance do sistema, interrompendo ou até travando o ambiente de produção dos clientes.
2) Evite manipular o banco de dados diretamente durante o desenvolvimento, pois isso pode gerar inconsistências e dificuldades futuras. Sempre prefira executar a tarefa "deployAddon" no Gradle para garantir que as alterações sejam aplicadas corretamente.
3) Testes são fundamentais: Realize sempre testes de instalação limpa e de atualizações para garantir que as migrações funcionem como esperado sem causar impactos indesejados.
4) Evite conflitos com outros projetos no banco de dados. Certifique-se de que as tabelas e campos que você cria não interfiram em outras implementações.
5) Use prefixos exclusivos para todos os objetos de banco de dados (como tabelas e campos). Isso ajuda a evitar conflitos e a manter a organização, especialmente em projetos que compartilham o mesmo banco de dados.


# 5. Dicionário de Dados

Para cada tabela, view ou script que você desejar criar ou alterar, crie um arquivo XML separado. Isso garante que a documentação e o recurso de autocompletar funcionem corretamente durante o desenvolvimento

- Validação no VS Code.
  - Para garantir que o arquivo XML seja validado corretamente no VS Code, é recomendada a instalação do plugin [XML](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-xml) da Red Hat. Esse plugin auxilia na verificação de erros e melhora a experiência de edição do XML, oferecendo recursos como autocompletar e validação de esquemas.



O arquivo deve seguir a estrutura definida, como no exemplo abaixo, para que a documentação e o autocomplete do XML funcionem de forma adequada no seu ambiente de desenvolvimento. Os arquivos devem ser criados no diretório 'datadictionary'.
```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<metadados xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:noNamespaceSchemaLocation="../.gradle/metadados.xsd">
   <table name="" sequenceType="">
      <description></description>
      <primaryKey>
         <field/>
      </primaryKey>
      <fields>
         <field name="" dataType="">
            <description></description>
         </field>
      </fields>
   </table>
</metadados>
```

# 6. Parâmetros
O Gradle cria automaticamente a configuração de parâmetros necessária durante o processo de build. Para criar o arquivo de parâmetros, o Gradle utiliza o group definido no arquivo build.gradle.
Para configurar seus parâmetros, basta criar o arquivo de configuração, conforme o exemplo abaixo, no seguinte caminho:

```
*-model/src/main/resources/br/com/sankhya/template/mm/parameters/parameter.xml
```


Assim, você pode adicionar e ajustar os parâmetros diretamente nesse arquivo para personalizar a configuração conforme necessário.
```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<!DOCTYPE parameters >
<parameters group-name="mge.:name" data-source="br.com.sankhya.modelcore.util.MGECoreParameter" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xsi:noNamespaceSchemaLocation="../../../../../.gradle/parameters.xsd">
</parameters>
```

# 7. Considerações Importantes

**Impacto**: Atualizações podem causar instabilidade no sistema do cliente se não forem devidamente testadas.

**Repositório**: Para cada addon que será desenvolvido usando o template, é necessário criar um novo repositório Git dedicado.

# 8. Testes em ambiente local
Para realizar o deploy do addon em um ambiente de testes local, com a variável serverFolder configurada corretamente, execute o comando abaixo:<br>
Linux
```bash
 ./gradlew clean deployAddon
```
Windows - Powershell
```bash
 ./gradlew.bat clean deployAddon
```

# 9. Código de exemplo

Neste projeto existem [exemplos](addon-template-model/src/main/java/br/com/fabricante/addon/exemplos) de como criar um SPBean, um JOB e um Listener.
- SPBean: Similar à um endpoint do spring boot, um SPBean é um serviço que será chamado via HTTP.
- Job: Uma rotina que será executada de tempos em tempos.
- Listener: Um Listener ouve aos eventos (inserção, edição, exclusão) de uma entidade.

Existem dois tipos de documentação em cada uma das classes, uma que ensina o que deve ser feito e outra é obrigatória.

Na documentação existem indicações de arquivos que precisam ser editados, como 'service-providers.xml' ou 'mgeschedule.xml'. O caminho sempre inicia com 'model' ou 'vc', fazendo referência
ao nome do projeto. Ex: quando nos referimos à 'model', estamos falando do diretório 'addon-template-model' neste exemplo.

É muito importante entender que se tratam apenas de *exemplos* e que *não recomendamos* que os mesmos sejam utilizados em produção.

Para fazer uma requisição HTTP ao serviço disponível neste exemplo:
Como o serviço deste exemplo utiliza autenticação, você deverá realizar login primeiro:

```bash
curl --location 'localhost:8080/mge/service.sbr?serviceName=MobileLoginSP.login&outputType=json' \
--header 'Content-Type: application/json' \
--data '{
	"requestBody": {
		"NOMUSU": {
			"$": "SUP"
		},
		"INTERNO": {
			"$": ""
		}
	}
}'
```

Veja que no exemplo acima, `NOMUSU` é SUP e `INTERNO` está vazio, indicando um login com SUP sem senha. O resultado da request acima é algo parecido com:

```json
{
    "serviceName": "MobileLoginSP.login",
    "status": "1",
    "pendingPrinting": "false",
    "transactionId": "DBC7CC7A1B7FB5A41084BA191D573F5B",
    "responseBody": {
        "callID": {
            "$": "B5F2AA7C501F0441267C1670AD45D027"
        },
        "jsessionid": {
            "$": "o4UWw05TD_GpRaxXnzp0wlpb-Z7bvVkiVEaEQP4W"
        },
        "idusu": {
            "$": "MA==\n"
        }
    }
}
```

Veja que há um atributo chamado `jsessionid`, é este que será usado no exemplo abaixo, no valor de `mgeSession`:

```bash
curl --location 'localhost:8080/addon-template/service.sbr?serviceName=ExemploServicoSP.getAlgumaInfo&mgeSession=${jsessionid válido}'
```
Se tudo ocorreu bem, você receberá a seguinte resposta:

```json
{
    "serviceName": "ExemploServicoSP.getAlgumaInfo",
    "status": "1",
    "pendingPrinting": "false",
    "transactionId": "5A5EE4FD5A0D499711BE2CCCA8D33DFF",
    "responseBody": {
        "codparc": "123456"
    }
}
```
---
## Recomendações
- Feche as conexões abertas com o DB após utiliza-las;
- Utilize os princípios do Clean Code;
- Trate suas exceções;

---
## Referências
- [Padrão de nomenclatura de branches](https://comunidade.sankhya.com.br/t/sankhya-gitflow-padroes-de-nomenclatura-de-branch-para-um-fluxo-de-desenvolvimento-eficiente/7189)
- [Developer Sankhya](https://developer.sankhya.com.br/docs/add-on)
