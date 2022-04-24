// Migration script used to migrate old data to new data structure
// Not a lot of effort went into this script, so it suck

const { Sequelize, DataTypes } = require('sequelize'),
  path = require('path');

// New Model

const newModelDataTypes = {
  id: {
    type: DataTypes.TEXT,
    primaryKey: true,
    unique: true,
    allowNull: false
  },
  requesterDiscordId: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  logMessageId: {
    type: DataTypes.TEXT,
    unique: true,
    allowNull: false
  },
  answers: {
    type: DataTypes.JSON,
    unique: false,
    allowNull: false
  }
};

// Old Model

const oldModelDataTypes = {
  id: {
    type: DataTypes.TEXT,
    primaryKey: true,
    unique: true,
    allowNull: false
  },
  senderId: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  verificationMessageId: {
    type: DataTypes.TEXT,
    unique: true,
    allowNull: false
  },
  firstAnswer: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  secondAnswer: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  thirdAnswer: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  fourthAnswer: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  fifthAnswer: {
    type: DataTypes.TEXT,
    allowNull: false
  }
};

///////////

const newDatabase = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false
});

const NewModel = newDatabase.define('VerificationTicket', newModelDataTypes);
NewModel.sync();

const oldDatabase = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'old-database.sqlite'),
  logging: false
});

const OldModel = oldDatabase.define('VerificationTicket', oldModelDataTypes);
OldModel.sync();

(async () => {
  const oldDataList = await OldModel.findAll();
  for (const oldData of oldDataList) {
    console.log(
      `Migrating\nTicket ID: ${oldData.id}\nUser ID: ${oldData.senderId}\nVerificatinion Log Message ID: ${oldData.verificationMessageId}\nFirst Answer: ${oldData.firstAnswer}\nSecond Answer: ${oldData.secondAnswer}\nThird Answer: ${oldData.thirdAnswer}\nFourth Answer: ${oldData.fourthAnswer}\nFifth Answer: ${oldData.fifthAnswer}`
    );
    await NewModel.create({
      id: oldData.id,
      requesterDiscordId: oldData.senderId,
      logMessageId: oldData.verificationMessageId,
      answers: {
        firstAnswer: oldData.firstAnswer,
        secondAnswer: oldData.secondAnswer,
        thirdAnswer: oldData.thirdAnswer,
        fourthAnswer: oldData.fourthAnswer,
        fifthAnswer: oldData.fifthAnswer
      }
    });
    console.log('\n');
  }
  console.log('Migration complete!\n');
  console.log(`Printing old database data...\n${JSON.stringify(await OldModel.findAll(), null, 2)}\n`);
  console.log(`Printing new database data...\n${JSON.stringify(await NewModel.findAll(), null, 2)}`);
})();
