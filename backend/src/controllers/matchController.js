import { calculateMatches } from '../services/matchingService.js';
export const getMyMatches = async (req, res) => {
    try {
        const userId = req.user.id;
        const topMatches = await calculateMatches(userId);
        res.status(200).json(topMatches);
    }
    catch (error) {
        console.error(error);
        if (error.message === 'Applicant profile not found') {
            res.status(404).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Error calculating matches' });
        }
    }
};
//# sourceMappingURL=matchController.js.map