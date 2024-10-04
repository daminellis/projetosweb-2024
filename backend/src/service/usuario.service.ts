import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUsuarioDto } from '../dto/usuarios/CreateUsuario.dto';
import { UpdateUsuarioDto } from '../dto/usuarios/UpdateUsuario.dto';
import Usuario from '../model/usuario.entity';

export type User = any;
@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>, // Permite acessar os métodos do Repository
  ) { }

  // FUNÇÕES PARA O CRUD DE USUÁRIOS
  //Econtra todos os usuários
  findAll(): Promise<Usuario[]> {
    return this.usuariosRepository.find(); // SELECT * FROM usuarios
  }
  //Encontra um usuário
  findOne(id: number): Promise<Usuario | null> {
    return this.usuariosRepository.findOneBy({ id }); // SELECT * FROM usuarios WHERE id = ...
  }
  async findOneByName(username: string): Promise<User | undefined> {
    return this.usuariosRepository.findOneBy({username});
  }

  //Cria um usuário
  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    const newUser = this.usuariosRepository.create(createUsuarioDto);
    return this.usuariosRepository.save(newUser); // INSERT INTO usuarios
  }

   // Atualiza um usuário
  async update(id: number, updateUsuarioDto: UpdateUsuarioDto): Promise<Usuario> {
    const usuario = await this.usuariosRepository.findOneBy({ id });
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // // Verificação de campos nulos ou inválidos
    // if (updateUsuarioDto.username && updateUsuarioDto.username.trim() === '') {
    //   throw new BadRequestException('Username não pode ser vazio');
    // }
    if (updateUsuarioDto.email && !this.isValidEmail(updateUsuarioDto.email)) {
      throw new BadRequestException('Email inválido');
    }

    Object.assign(usuario, updateUsuarioDto);
    return this.usuariosRepository.save(usuario); // UPDATE usuarios SET ...
  }

  async delete(id: number): Promise<void> {
    const usuario = await this.usuariosRepository.findOneBy({ id });
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }
    await this.usuariosRepository.delete(id); 
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

}