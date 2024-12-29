const { message } = require('../schemas/guidesSchema');
const guideServices = require('../services/guideServices');

exports.getGuides = async (req, res) => {
    try {
        const confirmedGuides = await guideServices.getConfirmedGuides();
        res.status(200).json(confirmedGuides);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.confirmGuides = async (req, res) => {
    const guides = req.body;
    try {
        const processedGuides = [];

        for(guideData of guides){
            const savedGuide = await guideServices.savedGuides(guideData);

            processedGuides.push({
                id: savedGuide.id,
                data: savedGuide.data
            });
        }

        return res.status(201).json({
            message: "Guía(s) creada con exito",
            data: processedGuides
        });
    } catch (error) {
        console.error("Error al crear las guías:", error);
        
        return res.status(500).json({
            message: "Error al crear las guías",
            error: error.message
        });
    }
}
