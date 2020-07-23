class CreateHomes < ActiveRecord::Migration[6.0]
  def change
    create_table :homes, id: :string do |t|
      t.string :address
      t.integer :price
      t.integer :zipcode
      t.string :county
      t.date :loandate
      t.string :auctionmonth
      t.float :lat
      t.float :lng
      t.string :firstlistingdate
      t.string :lastseendate

      t.timestamps
    end
  end
end
