const regex = /(Lunes|Martes|Miércoles|Jueves|Viernes|Sábado|Domingo)\s+(\d{2}:\d{2})-(\d{2}:\d{2})/;
const text = "React - Curso de ReactLunes 08:00-10:00A-1 - Bloque AEditarEliminar";
console.log(text.match(regex));
