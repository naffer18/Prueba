window.onload=function(){rutaRecursos="/actividades/"+$(document).data("idActividad")+"/";rutaRecursos="";cargarDatosPrint();}
function cargarDatosPrint()
{xmlDoc=cargarXMLJS();if((xmlDoc!=null)&&(xmlDoc!=undefined))
{try{extraerDatosPrint();}
catch(e){errorXML();}
crearPrint();}
else
{errorXML();}}
function errorXML()
{$.get("/avisoEstructuraXml.php");$("#lienzo").html("<div id='errorXML'>"+$(document).data("loadingXmlError")+"</div>");}
function cargarXMLJS(){return jQuery.parseXML(DatosActividad);}
function extraerDatosPrint()
{try{origen_recursos=xmlDoc.getElementsByTagName("origen_recursos")[0].childNodes[0].nodeValue;}catch(e){origen_recursos=false;}
if(origen_recursos){rutaRecursos=origen_recursos;}
autor=xmlDoc.getElementsByTagName("autor")[0].childNodes[0].nodeValue;titulo=xmlDoc.getElementsByTagName("tituloApli")[0].childNodes[0].nodeValue;elementos=new Array();var palabras=xmlDoc.getElementsByTagName("palabras")[0].getElementsByTagName("pal");for(i=0;i<palabras.length;i++)
{var datosPalabra=new Array();palabra=palabras[i];datosPalabra["Deftipo"]=palabra.getElementsByTagName("deftipo")[0].childNodes[0].nodeValue;datosPalabra["Opcion"]=palabra.getElementsByTagName("opcion")[0].childNodes[0].nodeValue;datosPalabra["Letra"]=palabra.getElementsByTagName("letra")[0].childNodes[0].nodeValue;if(palabra.getElementsByTagName("definicion")[0].childNodes[0]==undefined){datosPalabra["Definicion"]="";}
else{datosPalabra["Definicion"]=palabra.getElementsByTagName("definicion")[0].childNodes[0].nodeValue;}
if(datosPalabra["Palabra"]=palabra.getElementsByTagName("palabra")[0].childNodes[0]==undefined){datosPalabra["Palabra"]="";}
else{datosPalabra["Palabra"]=palabra.getElementsByTagName("palabra")[0].childNodes[0].nodeValue;}
datosPalabra["Activa"]=palabra.getElementsByTagName("palActiva")[0].childNodes[0].nodeValue;elementos[i]=datosPalabra;}
var idioma=xmlDoc.getElementsByTagName("idioma")[0];txtAutor=idioma.getElementsByTagName("txtAutor")[0].childNodes[0].nodeValue;txtPistaEnFormatoAudio=idioma.getElementsByTagName("txtPistaEnFormatoAudio")[0].childNodes[0].nodeValue;}
function crearPrint()
{$("#txtTitAct").html(titulo);$("#textoAutor").html(txtAutor+" : ");$("#nombreAutor").html(autor);var divPrincipal=$("<div>",{id:"principal"});$('#lienzo').append(divPrincipal);var divwp=$("<div>",{id:"wrapperPasapalabraI","class":"wrapperPasapalabra"});$('#principal').append(divwp);var divcl=$("<div>",{id:"containerLettersI","class":"containerLetters"});$('#wrapperPasapalabraI').append(divcl);var divi=$("<div>",{id:"innerI","class":"inner"});$('#containerLettersI').append(divi);var arrayGrad=['172.8','159','145.2','131.4','117.6','103.8','90','76.2','62.4','48.6','34.8','21','7.2','-7.2','-21','-34.8','-48.6','-62.4','-76.2','-90','-103.8','-117.6','-131.4','-145.2','-159','-172.8'];var letras=['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];for(i=0;i<arrayGrad.length;i++){var extra="";if(elementos[i]['Activa']=='0')extra=" turnOff";var divElemento=$("<div>",{id:"circle"+i,"class":"circle"+extra,"data-angle":arrayGrad[i]});$('#innerI').append(divElemento);$("#circle"+i).html(letras[i]);}
var posicionPista='#pistasDerecha';for(i=0;i<elementos.length;i++){if(elementos[i]['Activa']=='1'){var definicion;switch(elementos[i]['Deftipo']){case'IMAGEN':definicion='<img src="'+rutaRecursos+elementos[i]['Definicion']+'">';break;case'AUDIO':definicion='<span class="audio">'+txtPistaEnFormatoAudio+'</span>';break;default:definicion=elementos[i]['Definicion'];}
var pista='<li><span class="numPista">'+elementos[i]['Letra']+'.</span><span class="pista">'+definicion+'</span><span class="pista lineaGris"></span></li>';$(posicionPista).append(pista);if(posicionPista=='#pistasDerecha'){posicionPista='#pistasIzquierda';}else{posicionPista='#pistasDerecha';}}}}
$(window).load(function(e){$(".inner").fitText();$(".circle").width($(".circle").height());$(".inner").height($(".inner").width());colocarLetras();});var colocarLetras=function(){!jQuery.easing&&(jQuery.easing={});!jQuery.easing.easeOutQuad&&(jQuery.easing.easeOutQuad=function(p){return 1-Math.pow(1-p,2);});var circleController={create:function(circle){var obj={angle:circle.data('angle'),element:circle,measure:$('<div />').css('width',360*8+parseFloat(circle.data('angle'))),update:circleController.update,reposition:circleController.reposition,};obj.reposition();return obj;},update:function(angle){this.angle=angle;this.reposition();},reposition:function(){var sizebox=$(".inner").width();var sizecircle=$(".circle").width()/2;var radians=this.angle*Math.PI/180,radius=sizebox/2;this.element.css({marginLeft:(Math.sin(radians)*radius-sizecircle)+'px',marginTop:(Math.cos(radians)*radius-sizecircle)+'px'});}};var spin={circles:[],prep:function(circles){for(var i=0,circle;i<circles.length;i++){this.circles.push(circleController.create($(circles[i])));}}};spin.prep($('.circle'));};