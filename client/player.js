class Player {
  constructor(connection) {
    this.connection = connection;
  }
}

export class KeyboardPlayer extends Player {
  constructor(connection) {
    super(connection);
  }
}

export class GamepadPlayer extends Player {
  constructor(connection) {
    super(connection);
  }
}
