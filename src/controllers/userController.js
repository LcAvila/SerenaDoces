const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        
        // Verificar se usuário já existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email já cadastrado' });
        }

        // Criar novo usuário
        const user = new User({
            name,
            email,
            password,
            phone
        });

        await user.save();

        // Gerar token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone
            },
            token
        });
    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({ error: 'Erro ao criar conta' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Tentativa de login:', { email }); // Log para debug

        // Encontrar usuário
        const user = await User.findOne({ email });
        if (!user) {
            console.log('Usuário não encontrado');
            return res.status(401).json({ error: 'Email ou senha inválidos' });
        }

        console.log('Usuário encontrado:', user.name); // Log para debug

        // Verificar senha
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Senha incorreta');
            return res.status(401).json({ error: 'Email ou senha inválidos' });
        }

        // Gerar token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('Login bem sucedido'); // Log para debug

        res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone
            },
            token
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro ao fazer login' });
    }
}; 