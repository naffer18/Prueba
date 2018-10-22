
//API Adaptador para ADL SCORM 1.2 y ADL SCORM 2004 y Flash (ActionScript 3)
//Este script implementa diferentes aspectos de comportamiento lógico común de un SCO.

//======================================================================================================================

//Cambiar estos valores preestablecidos para adaptarse a las preferencias y requisitos propios.
var adr_ShowError = true; //Cambiar a true para mostrar los mensajes de error
//Mensajes de error
//Cambiar estos valores si g_bShowApiErrors es true y necesita cambiar los mensajes de error
var adrErrorAPINoEncontrada = "No se ha podido establecer comunicación con el servidor.\nLos datos no serán guardados.";
var g_strAPITooDeep = "Cannot find API - too deeply nested.";
var adrErrorAPINoInicializada = "Se ha localizado el API pero no se ha podido inicializar.";
var g_strAPISetError = "No se ha localizado el API.";
var g_strFSAPIError = 'LMS API adapter returned error code: "%1"\nWhen FScommand called API.%2\nwith "%3"';
var g_strDisableErrorMsgs = "Selecciona Cancelar para deshabilitar los errores futuros.";

//======================================================================================================================

//Variables relativas a la API y su estado
var adr_IntentosLocalizarAPI = 0;
var adr_API = null;
var adr_Inicializado = false;
var adr_Finalizado = false;
var adr_FechaInicilizacion=null;
var adr_MaximosIntentosLocalizarAPI=50;
var adr_VersionSCORM='';

//variables para almacenar los nombres de las funciones del estándar Scorm
var adr_API_Inicializar='';
var adr_API_Finalizar='';
var adr_API_Commit='';
var adr_API_SetValue='';
var adr_API_GetValue='';
var adr_API_GetError='';
var adr_API_GetErrorString;
var adr_API_variablesAUtilizar=null;

//======================================================================================================================

//Función para mostrar los errores
function adrMostrarError(error){
	if (adr_ShowError){
		alert(error);
	}
}

//Función para iniciaizar las varibles a utilizar, estas varibles dependen de la versión del Scorm a utilizar
function inicializarFunciones(){
	if (adr_VersionSCORM=='1.2'){
		//Funciones
		adr_API_Inicializar='LMSInitialize';
		adr_API_Finalizar='LMSFinish';
		adr_API_Commit='LMSCommit';
		adr_API_SetValue='LMSSetValue';
		adr_API_GetValue='LMSGetValue';
		adr_API_GetLastError='LMSGetLastError';
		adr_API_GetErrorString='LMSGetErrorString';
		adr_API_variablesAUtilizar=new Array();
		//Estado de la actividad (si ha sido finalizada y superada)
		adr_API_variablesAUtilizar['estado']=new Array();
		adr_API_variablesAUtilizar['estado']['nombre']='cmi.core.lesson_status';
		adr_API_variablesAUtilizar['estado']['valores']=new Array();
		adr_API_variablesAUtilizar['estado']['valores']['finalizadoOK']='completed'; 	  //Actividad finalizada y superada
		adr_API_variablesAUtilizar['estado']['valores']['finalizadoERROR']='failed';  //Actividad finalizada y no superada
		adr_API_variablesAUtilizar['estado']['valores']['noFinalizado']='incomplete'; //Actividad no finalizada
		//Tiempo usado por el alumno
		adr_API_variablesAUtilizar['tiempo']=new Array();
		adr_API_variablesAUtilizar['tiempo']['nombre']='cmi.core.session_time';
		adr_API_variablesAUtilizar['tiempo']['funcion']='adrConvertirTiempo';
		//Puntuación del alumno
		adr_API_variablesAUtilizar['resultado']=new Array();
		adr_API_variablesAUtilizar['resultado']['nombre']='cmi.core.score.raw';
		//Puntuación máxima
		adr_API_variablesAUtilizar['maximo']=new Array();
		adr_API_variablesAUtilizar['maximo']['nombre']='cmi.core.score.max';
		//Puntuación mínima
		adr_API_variablesAUtilizar['minimo']=new Array();
		adr_API_variablesAUtilizar['minimo']['nombre']='cmi.core.score.min';
	}
	if (adr_VersionSCORM=='2004'){
		//Funciones
		adr_API_Inicializar='Initialize';
		adr_API_Finalizar='Terminate';
		adr_API_Commit='Commit';
		adr_API_SetValue='SetValue';
		adr_API_GetValue='GetValue';
		adr_API_GetLastError='GetLastError';
		adr_API_GetErrorString='GetErrorString';
		adr_API_variablesAUtilizar=new Array();
		//Estado de la actividad (si ha sido finalizada y superada)
		adr_API_variablesAUtilizar['estado']=new Array();
		adr_API_variablesAUtilizar['estado']['nombre']='cmi.completion_status';
		adr_API_variablesAUtilizar['estado']['valores']=new Array();
		adr_API_variablesAUtilizar['estado']['valores']['finalizadoOK']='completed';	 //Actividad finalizada y superada
		adr_API_variablesAUtilizar['estado']['valores']['finalizadoERROR']='incomplete'; //Actividad finalizada y no superada
		adr_API_variablesAUtilizar['estado']['valores']['noFinalizado']='not attempted'; //Actividad no finalizada
		//Tiempo usado por el alumno
		adr_API_variablesAUtilizar['tiempo']=new Array();
		adr_API_variablesAUtilizar['tiempo']['nombre']='cmi.session_time';
		adr_API_variablesAUtilizar['tiempo']['funcion']='adrConvertirTiempo';
		//Puntuación del alumno
		adr_API_variablesAUtilizar['resultado']=new Array();
		adr_API_variablesAUtilizar['resultado']['nombre']='cmi.score.raw';
		//Puntuación máxima
		adr_API_variablesAUtilizar['maximo']=new Array();
		adr_API_variablesAUtilizar['maximo']['nombre']='cmi.score.max';
		//Puntuación mínima
		adr_API_variablesAUtilizar['minimo']=new Array();
		adr_API_variablesAUtilizar['minimo']['nombre']='cmi.score.min';
	}
}

//Función para comprobar si encuentra el Scorm y la versión del mismo (1.2 o 2004)
function adrLocalizaAPI(win){
	//Comprobar Scorm
	while ((win.API == null) && (win.API_1484_11 == null) && (win.parent != null) && (win.parent != win)) {
		adr_IntentosLocalizarAPI ++;
		if (adr_IntentosLocalizarAPI > adr_MaximosIntentosLocalizarAPI) {
			adrMostrarError(adrErrorAPINoEncontrada);
			return null;
		}
		win = win.parent;
	}
	//Comprobar versión
	if (win.API!= null){
		adr_VersionSCORM='1.2';
		return win.API;
	}
	if (win.API_1484_11 != null){
		adr_VersionSCORM='2004';
		return win.API_1484_11;
	}
	return null;
}

//Función para comprobar el estado de la API
function APIOK(){
	return ((typeof(adr_API)!= "undefined") && (adr_API != null));
}

//Función para inicilizar la sesión
function adrInicializar(){
	var resultado = true;
	if (adr_Inicializado){
		return true;
	}
	if ((window.parent) && (window.parent != window)){
		adr_API = adrLocalizaAPI(window.parent);
	}
	if ((adr_API == null) && (window.opener != null)){
		adr_API = adrLocalizaAPI(window.opener);
	}
	if (!APIOK()){
		adrMostrarError(adrErrorAPINoEncontrada);
		return false;
	}
	inicializarFunciones();
	resultado  = eval('adr_API.' + adr_API_Inicializar + '("");');
	if (!resultado){
		mostrarError(adrErrorAPINoInicializada);
		return false;
	}
	adr_Inicializado = true;
	return true;
}

//Función para finalizar la sesión
function adrFinalizar() {
	if ((APIOK()) && (adr_Finalizado == false)) {
		resultado  = eval('adr_API.' + adr_API_Finalizar + '("");');
		adr_Finalizado=true;
	}
	return true;
}

//Función para pasar una variable y su valor a Scorm
function adrSetValue(variable,valor){
	if (!APIOK()){
		return false;
	}
	if (adr_API_variablesAUtilizar== "undefined" || adr_API_variablesAUtilizar=="undefined"){
		return false;
	}
	var variableScorm=adr_API_variablesAUtilizar[variable]['nombre'];
	var nuevoValor=valor;
	if (adr_API_variablesAUtilizar[variable]['valores']!=undefined){
		nuevoValor=adr_API_variablesAUtilizar[variable]['valores'][valor];
	}else if (adr_API_variablesAUtilizar[variable]['funcion']!= undefined){
		var funcion=adr_API_variablesAUtilizar[variable]['funcion'];
		nuevoValor  = eval(funcion+'('+valor+');');
	}
	resultado  = eval('adr_API.' + adr_API_SetValue + '("'+ variableScorm + '","' + nuevoValor + '");');
	return resultado;
}

//Función para obtener un valor de una variable Scorm
function adrGetValue(variable){
	if (!APIOK()){
		return false;
	}
	if (adr_API_variablesAUtilizar== "undefined" || adr_API_variablesAUtilizar=="undefined"){
		return false;
	}
	var variableScorm=adr_API_variablesAUtilizar[variable]['nombre'];
	return valor;
}

//Función para realizar el envio de datos al servidor
function adrCommit(){
	if (!APIOK()){
		return false;
	}
	resultado  = eval('adr_API.' + adr_API_Commit+'("");');
	return resultado;
}

//Función para comprobar si la actividad ha sido superada con anterioridad
function adrComprobarEstado(){
	if (!APIOK()){
		return false;
	}
	var valor=eval('adr_API.' + adr_API_GetValue + '("'+ adr_API_variablesAUtilizar['estado']['nombre'] +'");');
	if((valor=="passed")||(valor=="completed")){
		return true;
	}else{
		return false;
	}
}

//Función para obtener el código de un error
function adrGetLastError(codigo){
	if (!APIOK()){
		return false;
	}
	resultado  = eval('adr_API.' + adr_API_GetLastError+'();');
	return resultado;
}

//Función para obtener el texto del error a partir de un código de error
function adrGetErrorString(){
	if (!APIOK()){
		return false;
	}
	resultado  = eval('adr_API.' + adr_API_GetErrorString+'('+codigo+');');
	return resultado;
}

//Función para comprobar si se ha realizado el registro, en caso negativo realizarlo
function comprobarRegistro()
{
	//LLamada al flash para comprobar si se ha registrado
	/*Para realizar la llamada desde JavaScript a ActionScript hay que tener varias cosas en cuenta:
		1- El nombre dado al objeto embebido en la página Web, en este caso el archivo .swf de nombre "actividad".
		2- Modificar el parámetro "allowScriptAccess" asignándole el valor "always" para que se ejecute de forma correcta
	*/
	actividad.callJavaScript();
}

//Función para convertir el tiempo a un formato correcto, dependiendo de la versión del Scorm
function adrConvertirTiempo(n){
	if (adr_VersionSCORM=='1.2'){	
		return MillisecondsToCMIDuration(n);
	}
	if (adr_VersionSCORM=='2004'){	
		return MillisecondsToCMIDuration2004(n);
	}
}

//Función para convertir duración de milisegundos a formato 0000:00:00.00 (HHHH:MM:SS.SS)
function MillisecondsToCMIDuration(n) {
	var hms = "";
	var dtm = new Date();	dtm.setTime(n);
	var h = "000" + Math.floor(n / 3600000);
	var m = "0" + dtm.getMinutes();
	var s = "0" + dtm.getSeconds();
	var cs = "0" + Math.round(dtm.getMilliseconds() / 10);
	hms = h.substr(h.length-4)+":"+m.substr(m.length-2)+":";
	hms += s.substr(s.length-2)+"."+cs.substr(cs.length-2);
	return hms
}

//Función para convertir duración de milisegundos a formato PThHmMsS
function MillisecondsToCMIDuration2004(n) {
	var hms = "";
	var dtm = new Date();	dtm.setTime(n);
	var h = "000" + Math.floor(n / 3600000);
	var m = "0" + dtm.getMinutes();
	var s = "0" + dtm.getSeconds();
	var cs = "0" + Math.round(dtm.getMilliseconds() / 10);
	hms = h.substr(h.length-4)+":"+m.substr(m.length-2)+":";
	hms += s.substr(s.length-2)+"."+cs.substr(cs.length-2);
	return "PT"+h+"H"+m+"M"+s+"S";
}