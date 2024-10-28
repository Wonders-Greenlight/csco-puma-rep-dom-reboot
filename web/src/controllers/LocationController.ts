import { Request, Response } from 'express'

// Models
import Location from '../models/LocationModel.js';

// Utils

class LocationController {
    public async getLocations( req: Request, res: Response ) {
        console.log('started getLocations')
        if ( !req.query.page ) 
            return res.status(400).json({ message: 'Cannot get locations without pagination' })
        console.log('started no errors yet ')
        const page = parseInt(req.query.page as string)
        const query = ( req.query.query ) ? JSON.parse(req.query.query as string) : {}
        const limit = req.query.limit && Number(req.query.limit) || 10
        const sort = req.query.sort ? JSON.parse(req.query.sort as string) : { createdAt: 'DESC' }
        console.log('started no errors yet 1 ')
        try {
            let results = await Location.find({})
            // console.log('no errors', results)
            return res.json(results)
        } catch (err) {
            console.log('error', err.message)
            return res.status(500).json({ message: err.message })
        }
    }

    public async getLocationById( req: Request, res: Response ) {
        const { id } = req.params

        try {
            const task = await Location.findById(id)
            if ( !!!task ) return res.status(404).json({ message: 'Not found' })
            
            return res.json(task)
        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
    }

    public async createLocation( req: Request, res: Response ) {
        try {
            const newLocation = await Location.create(req.body)
            return res.json(newLocation)
        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
    }

    public async deleteLocation( req: Request, res: Response ) {
        const { id } = req.params

        try {
            const result = await Location.findByIdAndDelete(id)
            if ( !!!result ) return res.status(404).json({ message: 'Not found' })
            
            return res.json(result)
        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
    }

    public async updateLocation( req: Request, res: Response ) {
        const { id } = req.params
        let bodyUpdate: any = { ...req.body }

        try {
            const location = await Location.findByIdAndUpdate(id, bodyUpdate, { new: true })
            
            return res.json({
                updated: true,
                message: 'Successfully updated',
                location
            })
        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
    }
}

let locationController = new LocationController()

export default locationController
export { LocationController }