import { CreateUsersTable1731274470958 } from 'src/migrations/1731274470958-CreateUsersTable';
import { CreateMetricsTable1731286037184 } from 'src/migrations/1731286037184-CreateMetricsTable';
import { DataSource } from 'typeorm';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + '/app/api_greenyellow/src/**/*.entity{.ts,.js}'],
  migrations: [CreateUsersTable1731274470958, CreateMetricsTable1731286037184],
  synchronize: false,
});

export default AppDataSource;
