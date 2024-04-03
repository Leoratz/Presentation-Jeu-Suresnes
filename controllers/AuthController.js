import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

const signUp = async (req, res) => {
    const { pseudo, password } = req.body

    const hashedPassword = await bcrypt.hash(password, 10)

    prisma.user.create({
        data: {
            pseudo,
            password: hashedPassword
        }
    })

    .then((user) => {
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: '24h'
        })
            res.json({ token, id: user.id, pseudo: user.pseudo })

    })

    .catch((error) => {
        res.json(error)
    })
}

const logIn = async (req, res) => {
     
    const { pseudo, password } = req.body

    const user = await prisma.user.findUnique({
        where: {
            pseudo
        }
    })

    if (!user) {
        return res.status(404).json({ message: 'User not found' })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
        return res.status(404).json({ error: 'Password not valid' })
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { 
        expiresIn: '24h' 
    })

    res.json({ token, id: user.id, pseudo: user.pseudo })
}



export { signUp, logIn }