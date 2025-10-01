import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class AddCourseTrainersRelation1680000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "course_trainers_user", // имя по умолчанию для связи ManyToMany
        columns: [
          { name: "courseId", type: "int", isPrimary: true },
          { name: "userId", type: "int", isPrimary: true },
        ],
        foreignKeys: [
          {
            columnNames: ["courseId"],
            referencedTableName: "course",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
          {
            columnNames: ["userId"],
            referencedTableName: "user",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("course_trainers_user");
  }
}