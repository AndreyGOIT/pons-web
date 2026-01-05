import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsActiveToCourse1700000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TABLE course
      ADD COLUMN isActive TINYINT(1) NOT NULL DEFAULT 1
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TABLE course
      DROP COLUMN isActive
    `);
    }
}