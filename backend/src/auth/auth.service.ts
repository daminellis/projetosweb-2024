import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../model/usuario.entity';
import { UsuarioService } from '../service/usuario.service';
import { Repository } from 'typeorm';

const saltRounds = 10;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioService: UsuarioService,
  ) {}

  async hashPassword(myPlaintextPassword: string): Promise<string> {
    try {
      const hash = await bcrypt.hash(myPlaintextPassword, saltRounds);
      console.log(hash);
      return hash;
    } catch (err) {
      throw new Error('Erro ao gerar o hash da senha');
    }
  }

  async comparePasswords(myPlaintextPassword: string, hash: string): Promise<boolean> {
    try {
      const result = await bcrypt.compare(myPlaintextPassword, hash);
      return result;
    } catch (err) {
      throw new Error('Erro ao comparar as senhas');
    }
  }

  async fetchUserFromDb(username: string): Promise<Usuario | null> {
    const users: Usuario[] = await this.usuarioService.findAll();
    return users.find(user => user.username === username) || null;
  }
 
  async checkUser(username: string, password: string): Promise<boolean> {
    const user: Usuario | null = await this.fetchUserFromDb(username);
  
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
  
    const match = await this.comparePasswords(password, user.senhaHash);
  
    if (match) {
      // login
      return true;
    }
  
    return false;
  }
}