const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Borrar
// console.log("URI:", process.env.MONGODB_URI);

// 1. Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('🔥 Conectado a MongoDB Atlas');
    // console.log('DB actual:', mongoose.connection.name);
})
.catch(err => console.error('Error conectando a Mongo:', err));


// 2. Modelo
const tarifaSchema = new mongoose.Schema({
    slug: String,
    nombre: String,
    precio_diario: Number,
    moneda: String,
    cobertura_medica: String
}, { collection: 'DemoAseguradora_Tarifas' });

const Tarifa = mongoose.model('DemoAseguradora_Tarifas', tarifaSchema);


// 3. Función para calcular días
const calcularDias = (fechaInicio, fechaFin) => {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    const diferenciaTiempo = Math.abs(fin - inicio);
    const diferenciaDias = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24));

    return diferenciaDias + 1;
};


// 4. Endpoint
app.post('/cotizar', async (req, res) => {
    try {
        const { destino, fechaInicio, fechaFin, pasajeros } = req.body;

        // Borrar
        // console.log("Destino recibido:", destino);

        // Validación
        if (!destino || !fechaInicio || !fechaFin || !pasajeros) {
            return res.status(400).json({
                error: "Faltan datos requeridos (destino, fechaInicio, fechaFin, pasajeros)"
            });
        }

        // Borrar
        const todas = await Tarifa.find();
        // console.log("Registros en DB:", todas.map(t => t.slug));

        // Búsqueda (mejorada)
        const plan = await Tarifa.findOne({
            slug: destino.trim().toLowerCase()
        });

        if (!plan) {
            return res.status(404).json({
                error: "Destino no encontrado en la base de datos"
            });
        }

        // Lógica
        const diasViaje = calcularDias(fechaInicio, fechaFin);
        const valorTotal = diasViaje * plan.precio_diario * pasajeros;

        res.json({
            exito: true,
            plan_nombre: plan.nombre,
            cobertura: plan.cobertura_medica,
            dias_calculados: diasViaje,
            pasajeros: pasajeros,
            valor_total_cop: valorTotal
        });

    } catch (error) {
        console.error("Error en la cotización:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});


// Ruta de prueba
app.get('/', (req, res) => {
    res.send('API del Cotizador IKE Asistencia Activo 🚀');
});


// 5. Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});