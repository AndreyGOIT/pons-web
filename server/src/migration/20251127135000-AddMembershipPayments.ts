// server/src/migration/20251127135000-AddMembershipPayments.ts
import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMembershipPayments20251127135000 implements MigrationInterface {
    name = "AddMembershipPayments20251127135000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      CREATE TABLE membership_payments (
        id INT NOT NULL AUTO_INCREMENT,
        userId INT NOT NULL,
        year INT NOT NULL,
        amount DECIMAL(8,2) NOT NULL DEFAULT 25.00,
        status ENUM('unpaid','pending','paid') NOT NULL DEFAULT 'unpaid',
        userMarkedAt DATETIME NULL,
        adminConfirmedAt DATETIME NULL,
        adminId INT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        UNIQUE KEY IDX_user_year (userId, year),
        PRIMARY KEY (id),
        
        CONSTRAINT FK_membership_user
          FOREIGN KEY (userId) REFERENCES user(id)
          ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE membership_payments`);
    }
}