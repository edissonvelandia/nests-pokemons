import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/poke-response.interface';
import { PokemonService } from 'src/pokemon/pokemon.service';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {


  constructor(
    @InjectModel( Pokemon.name )
    private readonly pokemonModel: Model<Pokemon>,

    private readonly http: AxiosAdapter
  ) {}

  //Mejor forma para insertar varios registros
  async executeSeed() {

    await this.pokemonModel.deleteMany({});

    const data = await this.http.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650');    

    const pokemonToInsert: { name: string, no: number }[] = [];

    data.results.forEach(({ name, url }) => {       
      const segments = url.split('/');
      const no: number = +segments[ segments.length - 2 ];

      pokemonToInsert.push({ name, no });      
    });

    await this.pokemonModel.insertMany( pokemonToInsert );
    return 'Seed Executed';
  }



  //Una forma de insertar varios registros
  async executeSeedOption1() {

    await this.pokemonModel.deleteMany({});

    const data = await this.http.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=10');    

    const insertPromisesArray = [];

    data.results.forEach(({ name, url }) => {
       
      const segments = url.split('/');
      const no: number = +segments[ segments.length - 2 ];

      // await this.pokemonModel.create({ no, name });

      insertPromisesArray.push(
        this.pokemonModel.create({ name, no })
      );
      
    });

    await Promise.all( insertPromisesArray );

    return 'Seed Executed';
  }

  
}
