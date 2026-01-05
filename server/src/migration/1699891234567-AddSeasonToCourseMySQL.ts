import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSeasonToCourseMySQL1699891234567 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE course
                ADD COLUMN season VARCHAR(50) NOT NULL DEFAULT 'legacy'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE course
            DROP COLUMN season
        `);
    }
}